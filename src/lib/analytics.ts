import React from 'react';
import posthog from 'posthog-js';

// Initialize PostHog analytics
const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(import.meta.env.VITE_POSTHOG_API_KEY || 'phc_test_key', {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll handle this manually
      capture_pageleave: true,
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          console.log('PostHog analytics initialized');
        }
      }
    });
  }
};

// Analytics event types for type safety
export type AnalyticsEvent = 
  | 'feature_generation_requested'
  | 'generation_succeeded'
  | 'generation_failed'
  | 'application_deployed'
  | 'preview_opened'
  | 'agent_selected'
  | 'code_edited'
  | 'project_created'
  | 'project_shared'
  | 'user_login'
  | 'user_logout'
  | 'subscription_upgraded'
  | 'tutorial_completed'
  | 'error_encountered';

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | Date;
}

class Analytics {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.isInitialized) {
      initializeAnalytics();
      this.isInitialized = true;
    }
  }

  // Track events with proper typing
  track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    try {
      posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        platform: 'web',
        environment: import.meta.env.MODE
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Identify users for personalized analytics
  identify(userId: string, userProperties?: AnalyticsProperties) {
    try {
      posthog.identify(userId, {
        ...userProperties,
        identified_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Analytics identification failed:', error);
    }
  }

  // Track page views manually
  trackPageView(pageName: string, properties?: AnalyticsProperties) {
    try {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        page_name: pageName,
        ...properties
      });
    } catch (error) {
      console.warn('Analytics page view tracking failed:', error);
    }
  }

  // Feature flag checking
  isFeatureEnabled(flagKey: string): boolean {
    try {
      return posthog.isFeatureEnabled(flagKey) || false;
    } catch (error) {
      console.warn('Feature flag check failed:', error);
      return false;
    }
  }

  // Track user properties
  setUserProperties(properties: AnalyticsProperties) {
    try {
      posthog.people.set(properties);
    } catch (error) {
      console.warn('Setting user properties failed:', error);
    }
  }

  // Reset analytics (for logout)
  reset() {
    try {
      posthog.reset();
    } catch (error) {
      console.warn('Analytics reset failed:', error);
    }
  }

  // Business metrics tracking
  trackBusinessMetric(metric: string, value: number, properties?: AnalyticsProperties) {
    this.track('business_metric' as AnalyticsEvent, {
      metric_name: metric,
      metric_value: value,
      ...properties
    });
  }

  // Performance tracking
  trackPerformance(action: string, duration: number, properties?: AnalyticsProperties) {
    this.track('performance_metric' as AnalyticsEvent, {
      action,
      duration_ms: duration,
      ...properties
    });
  }

  // Error tracking
  trackError(error: Error, context?: string, properties?: AnalyticsProperties) {
    this.track('error_encountered', {
      error_message: error.message,
      error_stack: error.stack || '',
      error_context: context || '',
      ...properties
    });
  }

  // AI interaction tracking
  trackAIInteraction(agentType: string, prompt: string, success: boolean, duration?: number) {
    this.track(success ? 'generation_succeeded' : 'generation_failed', {
      agent_type: agentType,
      prompt_length: prompt.length,
      prompt_words: prompt.split(' ').length,
      duration_ms: duration || 0,
      success
    });
  }

  // Deployment tracking
  trackDeployment(platform: string, success: boolean, appType?: string) {
    this.track('application_deployed', {
      deployment_platform: platform,
      deployment_success: success,
      app_type: appType || ''
    });
  }

  // User engagement tracking
  trackEngagement(action: string, value?: number, properties?: AnalyticsProperties) {
    this.track('user_engagement' as AnalyticsEvent, {
      engagement_action: action,
      engagement_value: value ?? 0,
      ...properties
    });
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Convenience hooks for React components
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    isFeatureEnabled: analytics.isFeatureEnabled.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
    reset: analytics.reset.bind(analytics),
    trackBusinessMetric: analytics.trackBusinessMetric.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackAIInteraction: analytics.trackAIInteraction.bind(analytics),
    trackDeployment: analytics.trackDeployment.bind(analytics),
    trackEngagement: analytics.trackEngagement.bind(analytics)
  };
};

// Higher-order component for automatic page tracking
export const withAnalytics = <P extends object>(
  Component: React.ComponentType<P>,
  pageName: string
): React.ComponentType<P> => {
  const WrappedComponent = (props: P) => {
    React.useEffect(() => {
      analytics.trackPageView(pageName);
    }, []);

    return React.createElement(Component, props);
  };
  
  return WrappedComponent;
};

export default analytics;