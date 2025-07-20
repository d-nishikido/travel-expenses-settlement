#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Ensures all required environment variables are set and valid
 */

const fs = require('fs');
const path = require('path');

// Define required environment variables and their validation rules
const ENV_SCHEMA = {
  // Database
  DB_HOST: {
    required: true,
    type: 'string',
    description: 'Database host address',
  },
  DB_PORT: {
    required: true,
    type: 'number',
    default: 5432,
    description: 'Database port',
  },
  DB_USER: {
    required: true,
    type: 'string',
    description: 'Database user',
  },
  DB_PASSWORD: {
    required: true,
    type: 'string',
    description: 'Database password',
  },
  DB_NAME: {
    required: true,
    type: 'string',
    description: 'Database name',
  },
  DATABASE_URL: {
    required: true,
    type: 'string',
    pattern: /^postgresql:\/\/.+/,
    description: 'PostgreSQL connection string',
  },
  
  // Application
  NODE_ENV: {
    required: true,
    type: 'string',
    enum: ['development', 'staging', 'production', 'test'],
    description: 'Node environment',
  },
  BACKEND_PORT: {
    required: true,
    type: 'number',
    default: 5000,
    description: 'Backend server port',
  },
  FRONTEND_PORT: {
    required: true,
    type: 'number',
    default: 3000,
    description: 'Frontend server port',
  },
  
  // Security
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    description: 'JWT secret key (min 32 characters)',
  },
  JWT_EXPIRES_IN: {
    required: true,
    type: 'string',
    pattern: /^\d+[dhms]$/,
    default: '1d',
    description: 'JWT expiration time',
  },
  
  // Frontend
  VITE_API_URL: {
    required: true,
    type: 'string',
    pattern: /^https?:\/\/.+/,
    description: 'API URL for frontend',
  },
  
  // Logging
  LOG_LEVEL: {
    required: false,
    type: 'string',
    enum: ['error', 'warn', 'info', 'debug'],
    default: 'info',
    description: 'Logging level',
  },
  LOG_FORMAT: {
    required: false,
    type: 'string',
    enum: ['json', 'dev', 'combined'],
    default: 'json',
    description: 'Log format',
  },
};

/**
 * Validate a single environment variable
 */
function validateEnvVar(key, value, schema) {
  const errors = [];
  
  // Check if required
  if (schema.required && !value) {
    if (schema.default !== undefined) {
      process.env[key] = String(schema.default);
      console.log(`✓ ${key}: Using default value "${schema.default}"`);
      return [];
    }
    errors.push(`${key} is required but not set`);
    return errors;
  }
  
  // Skip validation if not set and not required
  if (!value && !schema.required) {
    if (schema.default !== undefined) {
      process.env[key] = String(schema.default);
      console.log(`✓ ${key}: Using default value "${schema.default}"`);
    }
    return [];
  }
  
  // Type validation
  if (schema.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) {
      errors.push(`${key} must be a number, got "${value}"`);
    }
  }
  
  // Enum validation
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${key} must be one of: ${schema.enum.join(', ')}, got "${value}"`);
  }
  
  // Pattern validation
  if (schema.pattern && !schema.pattern.test(value)) {
    errors.push(`${key} does not match required pattern: ${schema.pattern}`);
  }
  
  // Min length validation
  if (schema.minLength && value.length < schema.minLength) {
    errors.push(`${key} must be at least ${schema.minLength} characters long`);
  }
  
  if (errors.length === 0) {
    console.log(`✓ ${key}: "${value}"`);
  }
  
  return errors;
}

/**
 * Load environment file
 */
function loadEnvFile(envFile) {
  if (!fs.existsSync(envFile)) {
    return {};
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }
    
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

/**
 * Main validation function
 */
function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  const errors = [];
  const warnings = [];
  
  // Check NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`Environment: ${nodeEnv}\n`);
  
  // Load .env file if exists
  const envFile = path.join(__dirname, '..', `.env.${nodeEnv}`);
  const envVars = loadEnvFile(envFile);
  
  // Merge with process.env (process.env takes precedence)
  Object.keys(envVars).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = envVars[key];
    }
  });
  
  // Validate each variable
  Object.entries(ENV_SCHEMA).forEach(([key, schema]) => {
    const value = process.env[key];
    const varErrors = validateEnvVar(key, value, schema);
    errors.push(...varErrors);
  });
  
  // Check for sensitive default values in production
  if (nodeEnv === 'production') {
    if (process.env.JWT_SECRET === 'dev-jwt-secret-change-in-production') {
      errors.push('JWT_SECRET must be changed from default value in production');
    }
    
    // Check for placeholder values
    Object.entries(process.env).forEach(([key, value]) => {
      if (value && value.includes('CHANGE_ME_IN_SECRETS')) {
        errors.push(`${key} contains placeholder value that must be replaced`);
      }
    });
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  
  if (errors.length > 0) {
    console.error('\n❌ Validation failed with errors:\n');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\nPlease fix the errors above and try again.');
    process.exit(1);
  }
  
  console.log('\n✅ All environment variables validated successfully!');
  
  // Write validated env vars to a file for reference
  const validatedEnvPath = path.join(__dirname, '..', '.env.validated');
  const validatedContent = Object.entries(ENV_SCHEMA)
    .map(([key, schema]) => {
      const value = process.env[key] || '';
      return `# ${schema.description}\n${key}=${value}`;
    })
    .join('\n\n');
  
  fs.writeFileSync(validatedEnvPath, validatedContent);
  console.log(`\n📝 Validated configuration written to: ${validatedEnvPath}`);
}

// Run validation if called directly
if (require.main === module) {
  validateEnvironment();
}

module.exports = {
  ENV_SCHEMA,
  validateEnvironment,
  validateEnvVar,
};