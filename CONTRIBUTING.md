# Contributing to SGP MCP Server

Thank you for your interest in contributing to SGP MCP Server! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:
1. Search existing issues to avoid duplicates
2. Use the appropriate issue template (Bug Report or Feature Request)
3. Provide as much detail as possible

### Development Workflow

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then:
   git clone https://github.com/thiagojbs/sgp-mcp-server.git
   cd sgp-mcp-server
   ```

2. **Set up development environment**
   ```bash
   # Install dependencies
   npm install
   
   # Copy environment template
   cp .env.example .env
   # Edit .env with your SGP credentials
   
   # Run tests
   npm test
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all tests pass

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new SGP tool for customer management
   
   - Implement sgp_get_customer_details tool
   - Add input validation and error handling
   - Include unit tests and documentation
   - Update API reference"
   ```

6. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## 📝 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

```typescript
/**
 * Retrieves customer details from SGP API
 * @param customerId - The customer ID to lookup
 * @param credentials - Authentication credentials
 * @returns Promise resolving to customer details
 */
async function getCustomerDetails(
  customerId: string,
  credentials: AuthCredentials
): Promise<SGPResponse<CustomerDetails>> {
  // Implementation
}
```

### File Organization

```
src/
├── auth/          # Authentication logic
├── client/        # SGP API client
├── http/          # HTTP server
├── mcp/           # MCP server
├── services/      # Business logic
├── types/         # TypeScript types
└── utils/         # Utility functions
```

### Adding New SGP Tools

1. **Define types** in `src/types/sgp.ts`:
   ```typescript
   export interface NewFeatureData {
     id: number;
     name: string;
     // ... other fields
   }
   ```

2. **Add service method** in `src/services/sgp-service.ts`:
   ```typescript
   async getNewFeature(id: string): Promise<SGPResponse<NewFeatureData>> {
     // Implementation
   }
   ```

3. **Add MCP tool** in `src/mcp/server.ts`:
   ```typescript
   {
     name: 'sgp_get_new_feature',
     description: 'Get new feature data',
     inputSchema: {
       type: 'object',
       properties: {
         id: { type: 'string', description: 'Feature ID' }
       },
       required: ['id']
     }
   }
   ```

4. **Add HTTP endpoint** in `src/http/server.ts`

5. **Add tests** in `tests/`

6. **Update documentation**

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --grep "authentication"
```

### Test Structure

```javascript
// tests/new-feature.test.js
describe('New Feature', () => {
  test('should handle valid input', async () => {
    // Test implementation
  });
  
  test('should handle invalid input', async () => {
    // Test error cases
  });
});
```

### Integration Testing

Test with actual SGP API (using test credentials):
```bash
# Set test environment
export SGP_BASE_URL=https://demo.sgp.net.br/api
export SGP_API_TOKEN=test_token

# Run integration tests
npm run test:integration
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter descriptions and return types
- Provide usage examples

### API Documentation

- Update `README.md` with new tools
- Add examples to `examples/` directory
- Update endpoint documentation in HTTP server

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new SGP customer management tool
fix: resolve authentication timeout issue
docs: update deployment instructions
test: add integration tests for ONU operations
refactor: improve error handling consistency
```

## 🔒 Security Considerations

### Sensitive Data

- Never commit credentials or API keys
- Use environment variables for configuration
- Sanitize log output to avoid exposing sensitive data

### Authentication

- Validate all input parameters
- Implement proper error handling
- Follow SGP API security guidelines

### Rate Limiting

- Respect SGP API rate limits
- Implement appropriate backoff strategies
- Cache responses when possible

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features, backward compatible
- Patch: Bug fixes, backward compatible

### Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Create release tag
5. Deploy to production environments
6. Update documentation

## 🌍 Community

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community chat
- **Pull Requests**: Code contributions and reviews

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn and contribute
- Follow GitHub's community guidelines

## 🛠 Development Environment

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- SGP API access (for testing)

### IDE Setup

Recommended VS Code extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- GitLens

### Environment Variables

```bash
# Required for development
SGP_BASE_URL=https://demo.sgp.net.br/api
SGP_API_TOKEN=your_test_token
SGP_USERNAME=your_test_username
SGP_PASSWORD=your_test_password

# Optional
LOG_LEVEL=debug
CACHE_TTL_SECONDS=300
```

## ❓ Getting Help

- Check existing [Issues](https://github.com/thiagojbs/sgp-mcp-server/issues)
- Read the [Documentation](README.md)
- Ask in [Discussions](https://github.com/thiagojbs/sgp-mcp-server/discussions)
- Review [Examples](examples/)

## 🙏 Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Project documentation

Thank you for helping make SGP MCP Server better for everyone!