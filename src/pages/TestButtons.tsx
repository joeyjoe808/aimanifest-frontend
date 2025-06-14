import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Delete, Edit, Search, Download, Upload, Share } from 'lucide-react';

export default function TestButtons() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Button Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Actions */}
          <div className="flex gap-2">
            <Input 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* CRUD Operations */}
          <div className="flex gap-2 flex-wrap">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
            
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Selected
            </Button>
            
            <Button variant="destructive">
              <Delete className="h-4 w-4 mr-2" />
              Delete Items
            </Button>
          </div>

          {/* File Operations */}
          <div className="flex gap-2">
            <Button variant="secondary">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            
            <Button variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </div>

          {/* Status Display */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedItems.length} items selected
            </Badge>
            <Button variant="ghost" size="sm">
              Clear Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}