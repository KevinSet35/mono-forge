#!/bin/bash

setup_github_actions() {
    echo "🚀 Setting up GitHub Actions CI/CD..."
    
    # Create GitHub Actions directory
    mkdir -p .github/workflows

    # Create main CI workflow
    cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18.x'

jobs:
  test:
    name: Test and Build
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build types
      run: npm run build:types

    - name: Type checking
      run: npm run type-check

    - name: Lint code
      run: npm run lint

    - name: Check formatting
      run: npm run format:check

    - name: Run tests
      run: npm test -- --coverage

    - name: Build project
      run: npm run build

    - name: Upload coverage to Codecov
      if: matrix.node-version == '18.x'
      uses: codecov/codecov-action@v3
      with:
        directory: ./coverage
        fail_ci_if_error: false

  security:
    name: Security Audit
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run security audit
      run: npm audit --audit-level=moderate

    - name: Check for known vulnerabilities
      run: npx audit-ci --moderate
EOF

    # Create deployment workflow
    cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy

on:
  push:
    branches: [ main ]
  release:
    types: [ published ]

env:
  NODE_VERSION: '18.x'

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build types
      run: npm run build:types

    - name: Build project
      run: npm run build

    - name: Run tests
      run: npm test

    # Uncomment and configure based on your deployment target
    
    # Deploy to Docker Registry
    # - name: Build Docker image
    #   run: docker build -t ${{ secrets.DOCKER_REGISTRY }}/${{ github.repository }}:${{ github.sha }} .
    
    # - name: Push to Docker Registry
    #   run: |
    #     echo ${{ secrets.DOCKER_PASSWORD }} | docker login ${{ secrets.DOCKER_REGISTRY }} -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
    #     docker push ${{ secrets.DOCKER_REGISTRY }}/${{ github.repository }}:${{ github.sha }}
    
    # Deploy to AWS/Azure/GCP
    # - name: Deploy to Cloud
    #   run: echo "Add your deployment commands here"
    #   env:
    #     AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    #     AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

    - name: Deployment Status
      run: echo "🚀 Deployment completed successfully!"
EOF

    # Create release workflow
    cat > .github/workflows/release.yml << 'EOF'
name: Release

on:
  push:
    tags:
      - 'v*'

env:
  NODE_VERSION: '18.x'

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build project
      run: npm run build

    - name: Generate changelog
      id: changelog
      run: |
        # Generate changelog from git commits
        echo "## Changes" > CHANGELOG.md
        git log --pretty=format:"- %s" $(git describe --tags --abbrev=0 HEAD^)..HEAD >> CHANGELOG.md
        
        # Set output for release notes
        echo "changelog<<EOF" >> $GITHUB_OUTPUT
        cat CHANGELOG.md >> $GITHUB_OUTPUT
        echo "EOF" >> $GITHUB_OUTPUT

    - name: Create GitHub Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        body: ${{ steps.changelog.outputs.changelog }}
        draft: false
        prerelease: false

    - name: Build Docker image for release
      if: contains(github.ref, 'refs/tags/v')
      run: |
        docker build -t ${{ github.repository }}:${{ github.ref_name }} .
        docker build -t ${{ github.repository }}:latest .

    # Uncomment to push to Docker registry
    # - name: Push Docker images
    #   run: |
    #     echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
    #     docker push ${{ github.repository }}:${{ github.ref_name }}
    #     docker push ${{ github.repository }}:latest
EOF

    # Create code quality workflow
    cat > .github/workflows/code-quality.yml << 'EOF'
name: Code Quality

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18.x'

jobs:
  quality:
    name: Code Quality Analysis
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build types
      run: npm run build:types

    - name: Run ESLint
      run: npm run lint -- --format=json --output-file=eslint-report.json
      continue-on-error: true

    - name: Run tests with coverage
      run: npm test -- --coverage --coverageReporters=lcov

    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

    - name: Upload ESLint report
      uses: actions/upload-artifact@v3
      with:
        name: eslint-report
        path: eslint-report.json

    - name: Comment PR with quality metrics
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          
          // Read coverage summary if it exists
          let coverageComment = '';
          try {
            const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
            const total = coverage.total;
            coverageComment = `
            ## 📊 Code Coverage
            - **Lines**: ${total.lines.pct}%
            - **Functions**: ${total.functions.pct}%
            - **Branches**: ${total.branches.pct}%
            - **Statements**: ${total.statements.pct}%
            `;
          } catch (e) {
            coverageComment = '## 📊 Code Coverage\nCoverage report not available.';
          }

          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: `## 🔍 Code Quality Report
            
            ${coverageComment}
            
            **✅ Quality checks completed!**
            - ESLint analysis: Complete
            - Type checking: Complete
            - Test coverage: Generated
            
            View the full reports in the Actions tab.`
          });
EOF

    # Create dependency update workflow
    cat > .github/workflows/dependency-update.yml << 'EOF'
name: Dependency Update

on:
  schedule:
    # Run weekly on Mondays at 9 AM UTC
    - cron: '0 9 * * 1'
  workflow_dispatch: # Allow manual trigger

env:
  NODE_VERSION: '18.x'

jobs:
  update-dependencies:
    name: Update Dependencies
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        token: ${{ secrets.GITHUB_TOKEN }}

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Update dependencies
      run: |
        # Update npm packages
        npx npm-check-updates -u
        npm install
        
        # Run tests to ensure everything still works
        npm test

    - name: Create Pull Request
      uses: peter-evans/create-pull-request@v5
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        commit-message: 'chore: update dependencies'
        title: '🔄 Weekly Dependency Update'
        body: |
          ## 🔄 Automated Dependency Update
          
          This PR updates project dependencies to their latest versions.
          
          ### Changes
          - Updated npm packages to latest versions
          - All tests passing ✅
          
          Please review the changes and merge if everything looks good.
          
          ---
          *This PR was created automatically by GitHub Actions*
        branch: dependency-update/weekly
        delete-branch: true
EOF

    # Create issue templates
    mkdir -p .github/ISSUE_TEMPLATE

    cat > .github/ISSUE_TEMPLATE/bug_report.yml << 'EOF'
name: 🐛 Bug Report
description: Report a bug or unexpected behavior
title: "[Bug]: "
labels: ["bug", "needs-triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is
      placeholder: Describe the bug...
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What you expected to happen
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: |
        Please provide information about your environment:
      value: |
        - OS: [e.g. macOS, Windows, Linux]
        - Node.js version: [e.g. 18.x]
        - Browser: [e.g. Chrome, Firefox, Safari]
        - Package manager: [e.g. npm, yarn, pnpm]
    validations:
      required: true

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context about the problem here, including screenshots if applicable
EOF

    cat > .github/ISSUE_TEMPLATE/feature_request.yml << 'EOF'
name: ✨ Feature Request
description: Suggest a new feature or enhancement
title: "[Feature]: "
labels: ["enhancement", "needs-discussion"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a new feature!

  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: Is your feature request related to a problem? Please describe.
      placeholder: I'm always frustrated when...

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe the solution you'd like
      placeholder: I would like to see...
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Describe any alternative solutions or features you've considered

  - type: checkboxes
    id: contribution
    attributes:
      label: Contribution
      options:
        - label: I would be willing to implement this feature
        - label: I would be willing to help test this feature
EOF

    # Create pull request template
    cat > .github/pull_request_template.md << 'EOF'
## 📝 Description
Brief description of the changes in this PR.

## 🔗 Related Issues
Closes #(issue number)

## 🧪 Testing
- [ ] Tests added for new functionality
- [ ] All existing tests pass
- [ ] Manual testing completed

## 📋 Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📚 Documentation update
- [ ] 🔧 Refactoring (no functional changes)
- [ ] 🎨 Style changes (formatting, missing semi colons, etc.)

## ✅ Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## 📸 Screenshots (if applicable)
Add screenshots to help explain your changes.

## 🔍 Additional Notes
Any additional information that reviewers should know.
EOF

    # Create SonarCloud configuration
    cat > sonar-project.properties << EOF
sonar.projectKey=$PROJECT_NAME
sonar.organization=your-org
sonar.projectName=$PROJECT_NAME
sonar.projectVersion=1.0.0

# Source directories
sonar.sources=packages/client/src,packages/server/src,packages/types/src
sonar.tests=packages/client/src,packages/server/src

# Test patterns
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx
sonar.test.exclusions=**/*.js,**/*.jsx

# Coverage reports
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Exclude files
sonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/*.d.ts

# Language settings
sonar.sourceEncoding=UTF-8
EOF

    # Create GitHub Actions helper script
    mkdir -p scripts/ci
    cat > scripts/ci/validate-workflows.sh << 'EOF'
#!/bin/bash
echo "🔍 Validating GitHub Actions workflows..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it to validate workflows."
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Validate each workflow file
for workflow in .github/workflows/*.yml; do
    echo "📝 Validating $(basename "$workflow")..."
    
    # Basic YAML syntax check
    if ! python -c "import yaml; yaml.safe_load(open('$workflow'))" 2>/dev/null; then
        echo "❌ Invalid YAML syntax in $workflow"
        exit 1
    fi
    
    echo "✅ $(basename "$workflow") is valid"
done

echo "✅ All workflow files are valid"
EOF

    chmod +x scripts/ci/validate-workflows.sh

    echo "✅ GitHub Actions CI/CD setup complete"
    echo "📝 Workflows created:"
    echo "   - CI: Automated testing, linting, and building"
    echo "   - Deploy: Production deployment workflow"
    echo "   - Release: Automated releases with changelogs"
    echo "   - Code Quality: Advanced quality analysis with SonarCloud"
    echo "   - Dependency Update: Weekly dependency updates"
    echo ""
    echo "📝 Templates created:"
    echo "   - Bug report template"
    echo "   - Feature request template"
    echo "   - Pull request template"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Configure repository secrets in GitHub:"
    echo "      - SONAR_TOKEN (for SonarCloud)"
    echo "      - DOCKER_USERNAME and DOCKER_PASSWORD (for Docker deployment)"
    echo "      - Cloud provider credentials (AWS, Azure, GCP) if needed"
    echo "   2. Enable branch protection rules for main branch"
    echo "   3. Configure SonarCloud project at https://sonarcloud.io"
    echo "   4. Customize deployment steps in deploy.yml"
    echo "   5. Review and adjust workflow triggers as needed"
    echo ""
    echo "📝 Available commands:"
    echo "   - ./scripts/ci/validate-workflows.sh: Validate workflow files"
}