#!/bin/bash

setup_supabase() {
    echo "🏗️ Setting up Supabase integration..."
    
    # Install Supabase dependencies
    cd packages/server
    npm install @supabase/supabase-js
    cd ../client
    npm install @supabase/supabase-js
    cd ../..
    
    # Create Supabase config directory
    mkdir -p config
    
    # Create Supabase client configuration
    cat > config/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
EOF

    # Create server-side Supabase service
    mkdir -p packages/server/src/services
    cat > packages/server/src/services/supabase.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
EOF

    # Create client-side Supabase hook
    mkdir -p packages/client/src/hooks
    cat > packages/client/src/hooks/useSupabase.ts << 'EOF'
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const useSupabase = (): SupabaseClient => {
  return useMemo(() => createClient(supabaseUrl, supabaseAnonKey), []);
};
EOF

    # Add environment variables template
    if [ ! -f .env.example ]; then
        cat > .env.example << 'EOF'
# Environment Variables Template
NODE_ENV=development
EOF
    fi

    cat >> .env.example << 'EOF'

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Client Environment Variables (.env.local)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF

    echo "✅ Supabase integration setup complete"
    echo "📝 Don't forget to:"
    echo "   1. Create your Supabase project at https://supabase.com"
    echo "   2. Update the environment variables in .env"
    echo "   3. Create .env.local in packages/client with REACT_APP_ variables"
}