'use client'

import { useState } from 'react'
import { Save, User, Globe, Lock, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UserProfile {
  id: string
  username: string
  email: string
  name?: string
  avatar?: string
  isPublic: boolean
  profile?: {
    isPublic: boolean
    showSpoilers: boolean
    bio?: string
  }
}

interface UserProfileFormProps {
  user: UserProfile
  onUpdate: (data: Partial<UserProfile>) => Promise<void>
  isLoading?: boolean
}

export function UserProfileForm({ user, onUpdate, isLoading }: UserProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username,
    bio: user.profile?.bio || '',
    isPublic: user.isPublic,
    profileIsPublic: user.profile?.isPublic || false,
    showSpoilers: user.profile?.showSpoilers || false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!hasChanges) return

    setIsSaving(true)
    try {
      await onUpdate({
        name: formData.name || undefined,
        isPublic: formData.isPublic,
        profile: {
          isPublic: formData.profileIsPublic,
          showSpoilers: formData.showSpoilers,
          bio: formData.bio || undefined
        }
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${user.username}`

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Update your personal information and display preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your display name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email is managed by your authentication provider
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell others about your movie and TV preferences..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Privacy & Sharing
          </CardTitle>
          <CardDescription>
            Control how your profile and watch activity is shared with others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="profile-public" className="text-sm font-medium">
                  Public Profile
                </Label>
                {formData.profileIsPublic ? (
                  <Badge variant="outline" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Allow others to discover and view your profile
              </p>
            </div>
            <Switch
              id="profile-public"
              checked={formData.profileIsPublic}
              onCheckedChange={(checked) => handleInputChange('profileIsPublic', checked)}
            />
          </div>

          {formData.profileIsPublic && (
            <>
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Your profile will be accessible at: <br />
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {profileUrl}
                  </code>
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="show-spoilers" className="text-sm font-medium">
                    Show Spoilers by Default
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display spoiler content without blurring on your public profile
                  </p>
                </div>
                <Switch
                  id="show-spoilers"
                  checked={formData.showSpoilers}
                  onCheckedChange={(checked) => handleInputChange('showSpoilers', checked)}
                />
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="global-public" className="text-sm font-medium">
                Include in Discovery
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow your profile to appear in user searches and recommendations
              </p>
            </div>
            <Switch
              id="global-public"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>
            Overview of your watch tracking activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Currently Watching</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Notes Written</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || isSaving || isLoading}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}