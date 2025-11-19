#!/bin/bash

# AI Coach Deployment Script
echo "🚀 AI Coach Deployment Script"
echo "================================"
echo ""

# Check if we can push to GitHub
echo "📦 Step 1: Pushing to GitHub..."
if git push origin main 2>&1; then
    echo "✅ Successfully pushed to GitHub!"
else
    echo "❌ GitHub push failed. Repository may not exist or you need access."
    echo ""
    echo "📝 To fix this:"
    echo "   1. Create repository at: https://github.com/new"
    echo "   2. Name it: cbr-ai-coach"
    echo "   3. Run: git remote set-url origin https://github.com/YOUR_USERNAME/cbr-ai-coach.git"
    echo "   4. Run: git push -u origin main"
    echo ""
    exit 1
fi

echo ""
echo "🌐 Step 2: Deploying to Vercel..."
echo "   Option A: Via Dashboard (Recommended)"
echo "   1. Go to: https://vercel.com"
echo "   2. Click 'Add New Project'"
echo "   3. Import your GitHub repository"
echo "   4. Click 'Deploy'"
echo ""
echo "   Option B: Via CLI"
echo "   Run: npx vercel --prod"
echo ""

echo "✅ Deployment script complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify GitHub push succeeded"
echo "   2. Deploy to Vercel (via dashboard or CLI)"
echo "   3. Delete old app from Vercel dashboard if needed"
echo ""

