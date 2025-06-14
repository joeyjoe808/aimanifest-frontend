import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Eye, Edit, MessageSquare } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CollaboratorSession {
  userId: number;
  username: string;
  projectId: number;
  cursor?: { line: number; column: number; file: string };
  selection?: { start: { line: number; column: number }; end: { line: number; column: number }; file: string };
  lastActivity: Date;
  isTyping: boolean;
  currentFile?: string;
}

interface CollaborationPanelProps {
  projectId: number;
  currentUserId: number;
  currentUsername: string;
}

export default function CollaborationPanel({ projectId, currentUserId, currentUsername }: CollaborationPanelProps) {
  const [isCollaborating, setIsCollaborating] = useState(false);
  const queryClient = useQueryClient();

  // Load active collaborators
  const { data: collaborators = [] } = useQuery<CollaboratorSession[]>({
    queryKey: ['/api/projects', projectId, 'collaborators'],
    enabled: !!projectId,
    refetchInterval: 2000, // Real-time updates
  });

  // Join collaboration session mutation
  const joinSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/projects/${projectId}/collaborate`, {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUserId,
          username: currentUsername
        })
      });
    },
    onSuccess: () => {
      setIsCollaborating(true);
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborators'] });
    }
  });

  const handleJoinSession = () => {
    joinSessionMutation.mutate();
  };

  const handleLeaveSession = () => {
    setIsCollaborating(false);
    // Leave session logic would go here
  };

  const getActivityStatus = (collaborator: CollaboratorSession) => {
    if (collaborator.isTyping) return 'typing';
    if (collaborator.currentFile) return 'viewing';
    return 'idle';
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'typing': return 'bg-green-500';
      case 'viewing': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Collaboration
          <Badge variant="secondary" className="ml-auto">
            {collaborators.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {!isCollaborating ? (
            <Button 
              onClick={handleJoinSession}
              disabled={joinSessionMutation.isPending}
              size="sm" 
              className="w-full"
            >
              {joinSessionMutation.isPending ? 'Joining...' : 'Join Session'}
            </Button>
          ) : (
            <Button 
              onClick={handleLeaveSession}
              variant="outline"
              size="sm" 
              className="w-full"
            >
              Leave Session
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Active Collaborators ({collaborators.length})
          </h4>
          
          {collaborators.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active collaborators
            </p>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collaborator) => {
                const status = getActivityStatus(collaborator);
                return (
                  <div key={collaborator.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {collaborator.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getActivityColor(status)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {collaborator.username}
                        {collaborator.userId === currentUserId && ' (You)'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {status === 'typing' && (
                          <>
                            <Edit className="h-3 w-3" />
                            <span>Typing...</span>
                          </>
                        )}
                        {status === 'viewing' && (
                          <>
                            <Eye className="h-3 w-3" />
                            <span className="truncate">{collaborator.currentFile}</span>
                          </>
                        )}
                        {status === 'idle' && (
                          <span>Idle</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isCollaborating && (
          <div className="pt-3 border-t">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Collaboration Features
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Chat
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}