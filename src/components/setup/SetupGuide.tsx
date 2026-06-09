'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  Key, 
  Shield, 
  UserPlus,
  Copy,
  Check
} from 'lucide-react';

export function SetupGuide() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reports collection
    match /reports/{reportId} {
      // Workers can create and read their own reports
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Only admins can update reports
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Worker Progress Tracker Setup</h1>
          <p className="text-muted-foreground">
            Follow these steps to configure your Firebase project and get started
          </p>
        </div>

        {/* Step 1: Firebase Project */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">1</Badge>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Create Firebase Project
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Firebase Console</a></li>
              <li>Click &quot;Create a project&quot; or use an existing project</li>
              <li>Enable Google Analytics (optional)</li>
              <li>Wait for project creation to complete</li>
            </ol>
          </CardContent>
        </Card>

        {/* Step 2: Enable Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">2</Badge>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Enable Authentication
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>In Firebase Console, go to <strong>Authentication</strong></li>
              <li>Click &quot;Get Started&quot;</li>
              <li>Enable <strong>Email/Password</strong> provider</li>
              <li>Click &quot;Save&quot;</li>
            </ol>
          </CardContent>
        </Card>

        {/* Step 3: Create Firestore Database */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">3</Badge>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Create Firestore Database
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>In Firebase Console, go to <strong>Firestore Database</strong></li>
              <li>Click &quot;Create Database&quot;</li>
              <li>Choose <strong>Start in test mode</strong> (we&apos;ll add security rules later)</li>
              <li>Select your preferred region</li>
              <li>Click &quot;Enable&quot;</li>
            </ol>
          </CardContent>
        </Card>

        {/* Step 4: Get Firebase Config */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">4</Badge>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Get Firebase Configuration
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>In Firebase Console, click the gear icon ⚙️ → <strong>Project settings</strong></li>
              <li>Scroll down to &quot;Your apps&quot; section</li>
              <li>Click the web icon (&lt;/&gt;)</li>
              <li>Register your app (hosting not required)</li>
              <li>Copy the Firebase configuration values</li>
            </ol>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration</AlertTitle>
              <AlertDescription>
                Update <code className="bg-muted px-1 rounded">.env.local</code> with your Firebase credentials:
                <div className="mt-2 space-y-1 text-xs">
                  <div>NEXT_PUBLIC_FIREBASE_API_KEY</div>
                  <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</div>
                  <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID</div>
                  <div>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</div>
                  <div>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</div>
                  <div>NEXT_PUBLIC_FIREBASE_APP_ID</div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 5: Set Security Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">5</Badge>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Set Firestore Security Rules
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Go to <strong>Firestore Database → Rules</strong> and paste the following:
            </p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                <code>{firestoreRules}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(firestoreRules, 'rules')}
              >
                {copied === 'rules' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 6: Create Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">6</Badge>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create Users
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                You need to create users in Firebase Authentication AND add their profile data to Firestore.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Step A: Create Authentication Users</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <strong>Authentication → Users</strong></li>
                <li>Click &quot;Add user&quot;</li>
                <li>Enter email and password</li>
                <li>Repeat for all users (1 admin + 3 workers)</li>
              </ol>

              <h4 className="font-semibold">Step B: Add User Profiles to Firestore</h4>
              <p className="text-sm text-muted-foreground">
                For each user created, add a document to the <code className="bg-muted px-1 rounded">users</code> collection:
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Collection: users
// Document ID: [use the UID from Authentication]

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin", // or "worker"
  "createdAt": [current timestamp]
}`}
                </pre>
              </div>

              <h4 className="font-semibold mt-4">Example Users:</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge>Admin</Badge>
                  <span>admin@company.com</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge variant="secondary">Worker</Badge>
                  <span>worker1@company.com</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge variant="secondary">Worker</Badge>
                  <span>worker2@company.com</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge variant="secondary">Worker</Badge>
                  <span>worker3@company.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">Ready to Go!</h3>
                <p className="text-sm text-green-600 dark:text-green-500">
                  After completing all steps, refresh this page to start using the application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
