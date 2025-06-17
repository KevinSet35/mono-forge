#!/bin/bash

setup_git() {
    echo "🔧 Setting up Git repository..."
    
    # Initialize git repository
    git init
    
    # Create .gitattributes for proper line endings
    cat > .gitattributes << 'EOF'
* text=auto
*.js text eol=lf
*.ts text eol=lf
*.json text eol=lf
*.md text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
EOF

    # Create initial commit
    if [ -z "$(git config user.name)" ]; then
        echo "📝 Please configure Git user information:"
        echo "git config --global user.name 'Your Name'"
        echo "git config --global user.email 'your.email@example.com'"
    fi

    echo "✅ Git repository initialized"
}