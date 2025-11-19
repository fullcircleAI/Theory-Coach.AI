#!/bin/bash

# Push to GitHub - Run this AFTER creating the repository

echo "🚀 Pushing AI Coach to GitHub"
echo "=============================="
echo ""

# Update remote URL
echo "📝 Updating remote URL..."
git remote set-url origin https://github.com/fullcircleAI/cbr-ai-coach.git

# Verify remote
echo ""
echo "✅ Remote configured:"
git remote -v

# Push to GitHub
echo ""
echo "📦 Pushing to GitHub..."
if git push -u origin main; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 Next step: Deploy to Vercel"
    echo "   1. Go to: https://vercel.com"
    echo "   2. Import repository: fullcircleAI/cbr-ai-coach"
    echo "   3. Click Deploy"
    echo ""
else
    echo ""
    echo "❌ Push failed. Make sure:"
    echo "   1. Repository exists: https://github.com/fullcircleAI/cbr-ai-coach"
    echo "   2. You have push access"
    echo "   3. You're authenticated with GitHub"
    echo ""
fi

