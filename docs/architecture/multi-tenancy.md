# Multi-Tenancy Architecture (Future)

> **Status**: Requirements gathering phase. Awaiting Keycloak requirements from DevOps.

## Vision

The platform will serve multiple ecosystems as isolated tenants:

| Ecosystem | Tenant Slug | Example URL |
|-----------|-------------|-------------|
| Cornerstone Network | `cornerstone` | `apps.{domain}/cornerstone/` |
| Municipal (MISA) | `misa` | `apps.{domain}/misa/` |
| Canadian Digital Trust | `cdt` | `apps.{domain}/cdt/` |
| Legal | `legal` | `apps.{domain}/legal/` |
| Mining | `mining` | `apps.{domain}/mining/` |

**Key principle**: Apps are ecosystem-agnostic. The same Forms Builder, Test Issuer, VCT Builder, etc. serve all tenants - only the data and configuration are tenant-specific.

---

## Requirements

### Data Isolation (Required)

Each tenant must have completely isolated:

| Data Type | Isolation Strategy |
|-----------|-------------------|
| Orbit credentials | Separate `orbit-settings.json` per tenant |
| Forms & submissions | Separate SQLite database per tenant |
| Uploaded assets | Separate uploads directory per tenant |
| Access logs | Filtered by tenant |
| User preferences | Scoped to tenant |

**Privacy requirement**: No ecosystem-specific data should be accessible across tenants.

### Shared Resources

These remain shared across all tenants:

- Application code (React apps, Express server)
- Static assets (CSS, JS bundles, icons)
- App definitions and configurations
- Feature releases (new features deploy to all tenants)

### Tenant Identification

**TBD**: How tenants are identified in requests:

| Option | Example | Pros | Cons |
|--------|---------|------|------|
| URL path | `/cornerstone/forms-builder` | Simple routing, single domain | Requires path rewriting |
| Subdomain | `cornerstone.apps.domain.ca` | Clean URLs | DNS/cert management |
| Keycloak claim | User's tenant from auth token | Automatic from login | Requires auth first |

### Authentication

**Current**: GitHub OAuth (single tenant)

**Future**: Enterprise Keycloak with tenant awareness

**Questions for DevOps**:
- One Keycloak realm with tenant-specific groups/roles?
- Or separate realms per tenant?
- How are tenant admins identified?
- How is tenant membership conveyed in tokens?

### Tenant Provisioning

**Workflow** (conceptual):

```
1. Super-admin creates new tenant in admin panel
   - Tenant slug, display name, description

2. System provisions tenant resources
   - Creates tenant data directory
   - Initializes empty databases
   - Sets up Keycloak client/realm (TBD)

3. Tenant admin receives access
   - Logs in via Keycloak
   - Configures Orbit credentials (LOB ID, API Key)
   - Requests Orbit LOB setup if needed

4. Tenant is operational
   - Users can access apps at tenant URL
```

**Orbit provisioning note**: Northern Block has APIs for creating LOBs, but credentials are delivered via email (not fully machine-readable). May need manual step or email parsing.

---

## Proposed Data Structure

```
/var/data/                          # ASSETS_PATH in production
├── tenants/
│   ├── cornerstone/
│   │   ├── orbit-settings.json     # Encrypted Orbit credentials
│   │   ├── forms.db                # SQLite database
│   │   ├── uploads/                # Uploaded files
│   │   └── metadata.json           # Tenant metadata
│   ├── misa/
│   │   ├── orbit-settings.json
│   │   ├── forms.db
│   │   └── uploads/
│   └── ...
├── platform/
│   ├── tenants.json                # Tenant registry
│   └── platform.db                 # Platform-level data (super-admin)
```

---

## Implementation Considerations

### Middleware Pattern

```javascript
// Conceptual - extract tenant from request
const resolveTenant = (req, res, next) => {
  // Option 1: From URL path
  const tenant = req.params.tenant;

  // Option 2: From subdomain
  // const tenant = req.hostname.split('.')[0];

  // Option 3: From Keycloak token
  // const tenant = req.user?.tenant;

  if (!tenantExists(tenant)) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  req.tenant = tenant;
  req.tenantPath = `/var/data/tenants/${tenant}`;
  next();
};
```

### Config Service Changes

Current `getOrbitApiConfig(apiType)` becomes `getOrbitApiConfig(tenant, apiType)`:

```javascript
// Before (single tenant)
const config = getOrbitApiConfig('verifier');

// After (multi-tenant)
const config = getOrbitApiConfig(req.tenant, 'verifier');
```

### Database Changes

Current single `forms.db` becomes tenant-specific:

```javascript
// Before
const db = new Database(process.env.DATABASE_URL || './forms.db');

// After
function getTenantDatabase(tenant) {
  const dbPath = path.join(TENANTS_PATH, tenant, 'forms.db');
  return new Database(dbPath);
}
```

---

## Migration Path

### Phase 1: Prepare (Current)
- Design with tenant-awareness in mind
- Keep data access patterns abstracted
- Document multi-tenancy requirements (this doc)

### Phase 2: Infrastructure
- Set up Keycloak integration
- Create tenant provisioning workflow
- Implement tenant middleware

### Phase 3: Data Migration
- Move existing Cornerstone data to `tenants/cornerstone/`
- Update all data access to be tenant-aware
- Test isolation thoroughly

### Phase 4: Launch
- Deploy multi-tenant version
- Provision additional tenants
- Monitor and iterate

---

## Open Questions

1. **Tenant identification method** - URL path vs subdomain vs Keycloak claim?

2. **Keycloak architecture** - Single realm with groups or multiple realms?

3. **Super-admin access** - Should there be a platform-level admin who can see all tenants?

4. **Tenant-specific customization** - Should tenants be able to customize branding, disable apps, etc.?

5. **Billing/quotas** - Any limits per tenant (storage, API calls, users)?

6. **Audit requirements** - Per-tenant audit logs? Cross-tenant audit for platform admin?

---

## Related Documents

- [Architecture Overview](overview.md)
- [Orbit Config Service](../orbit-integration/config-service.md)
- [Apps Structure](apps.md)

---

*Last updated: January 2026*
*Awaiting: Keycloak requirements from DevOps*
