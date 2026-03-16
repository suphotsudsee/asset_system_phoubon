# Release Management - ระบบงานทะเบียนครุภัณฑ์

## สารบัญ
1. [Release Strategy](#release-strategy)
2. [Versioning](#versioning)
3. [Release Process](#release-process)
4. [Release Notes Template](#release-notes-template)
5. [Rollback Plan](#rollback-plan)
6. [Go-Live Plan](#go-live-plan)

---

## Release Strategy

### Release Types

#### Major Release (X.0.0)
- **Frequency**: Quarterly
- **Scope**: Breaking changes, major features
- **Testing**: Full regression testing
- **Approval**: Change Advisory Board (CAB)

#### Minor Release (x.Y.0)
- **Frequency**: Monthly
- **Scope**: New features, enhancements
- **Testing**: Integration + E2E testing
- **Approval**: Product Owner

#### Patch Release (x.y.Z)
- **Frequency**: As needed
- **Scope**: Bug fixes, security patches
- **Testing**: Smoke testing
- **Approval**: Tech Lead

---

## Versioning

### Semantic Versioning (SemVer)
```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─ Bug fixes (backward compatible)
  │     └─────── New features (backward compatible)
  └───────────── Breaking changes
```

### Version Format
```
v1.0.0          - Initial release
v1.1.0          - New features
v1.1.1          - Bug fixes
v2.0.0          - Breaking changes
v2.0.0-beta.1   - Beta release
v2.0.0-rc.1     - Release candidate
```

### Version Files
```
VERSION         - Current version number
CHANGELOG.md    - Version history
RELEASE.md      - Release process
```

---

## Release Process

### Pre-Release Checklist

#### Code Quality
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage > 80%
- [ ] No critical security vulnerabilities
- [ ] Code review completed
- [ ] Static analysis passed (SonarQube)

#### Documentation
- [ ] API documentation updated
- [ ] User manual updated
- [ ] Admin manual updated
- [ ] Release notes drafted
- [ ] CHANGELOG.md updated

#### Testing
- [ ] Performance tests passed
- [ ] Security scan passed
- [ ] Accessibility tests passed
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness tested

#### Infrastructure
- [ ] Staging environment ready
- [ ] Production environment ready
- [ ] Backup completed
- [ ] Rollback plan prepared
- [ ] Monitoring configured

### Release Steps

#### 1. Create Release Branch
```bash
git checkout -b release/v1.0.0 main
```

#### 2. Update Version
```bash
# Update VERSION file
echo "1.0.0" > VERSION

# Update package.json
npm version 1.0.0 --no-git-tag-version
```

#### 3. Update CHANGELOG
Edit CHANGELOG.md with all changes since last release.

#### 4. Run Final Tests
```bash
npm test
npm run test:e2e
npm run test:performance
```

#### 5. Build and Deploy to Staging
```bash
docker-compose -f docker-compose.staging.yml up -d
./scripts/smoke-test.sh
```

#### 6. User Acceptance Testing (UAT)
- Product Owner validates features
- QA team validates quality
- Stakeholders sign off

#### 7. Create Release Tag
```bash
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin --tags
```

#### 8. Build Production Images
```bash
docker-compose build
docker tag asset_system_phoubon_backend:latest ghcr.io/org/backend:1.0.0
docker tag asset_system_phoubon_frontend:latest ghcr.io/org/frontend:1.0.0
docker push ghcr.io/org/backend:1.0.0
docker push ghcr.io/org/frontend:1.0.0
```

#### 9. Deploy to Production
```bash
./scripts/deploy.sh production
```

#### 10. Post-Release Verification
- Run health checks
- Monitor metrics
- Verify key features
- Check error rates

#### 11. Announce Release
- Send release announcement
- Update stakeholders
- Publish release notes

---

## Release Notes Template

```markdown
# Release v1.0.0 - 2026-03-16

## Overview
Brief description of this release.

## 🎉 New Features
- Feature 1: Description
- Feature 2: Description

## 🐛 Bug Fixes
- Fix 1: Description
- Fix 2: Description

## 🔒 Security
- Security update 1
- Security update 2

## 📊 Performance
- Performance improvement 1
- Performance improvement 2

## ⚠️ Breaking Changes
- Breaking change 1 (migration required)
- Breaking change 2

## 📝 Migration Guide
Steps required to migrate from previous version.

```sql
-- Run migrations
npm run db:migrate
```

## 📀 Docker Images
- Backend: ghcr.io/org/backend:1.0.0
- Frontend: ghcr.io/org/frontend:1.0.0

## ✅ Verification Checklist
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Documentation updated

## 👥 Contributors
- Developer 1
- Developer 2

## 📞 Support
Contact support@asset-system.com for issues.
```

---

## Rollback Plan

### Rollback Triggers
Rollback when:
- Critical bug affecting >50% users
- Data corruption detected
- Security vulnerability found
- Performance degradation >50%
- Error rate >5%

### Rollback Procedure

#### Immediate Rollback (< 5 minutes)
```bash
#!/bin/bash
VERSION=$1

echo "Initiating emergency rollback to $VERSION..."

# Stop current deployment
docker-compose down

# Checkout previous version
git checkout $VERSION

# Restore database if needed
./scripts/restore-db.sh $VERSION

# Start previous version
docker-compose up -d

# Verify
./scripts/health-check.sh

echo "Rollback completed!"
```

#### Planned Rollback (< 1 hour)
```bash
# 1. Notify stakeholders
./scripts/notify-rollback.sh

# 2. Create backup
./scripts/backup.sh

# 3. Stop services
docker-compose down

# 4. Restore code
git checkout <previous-tag>

# 5. Restore database
docker exec -i asset_db psql -U assetuser asset_registry < backup.sql

# 6. Start services
docker-compose up -d

# 7. Verify
./scripts/verify.sh

# 8. Post-mortem
./scripts/post-mortem.sh
```

### Rollback Decision Tree
```
Production Issue Detected
         │
    ┌────▼────┐
    │ Severity │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
  Critical   Minor
    │         │
    │         └─→ Fix in next patch
    │
    └─→ Rollback
         │
    ┌────▼────┐
    │ Impact  │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
  Data     No Data
  Loss      Loss
    │         │
    │         └─→ Code rollback
    │
    └─→ DB restore + Code rollback
```

---

## Go-Live Plan

### Go-Live Checklist

#### T-7 Days (One Week Before)
- [ ] Code freeze
- [ ] Final testing completed
- [ ] Documentation reviewed
- [ ] Training completed
- [ ] Support team briefed

#### T-3 Days
- [ ] Staging deployment verified
- [ ] Performance tests passed
- [ ] Security audit completed
- [ ] Backup strategy tested
- [ ] Rollback plan tested

#### T-1 Day
- [ ] Production environment ready
- [ ] Monitoring configured
- [ ] On-call team assigned
- [ ] Communication plan ready
- [ ] Stakeholders notified

#### T-0 (Go-Live Day)
- [ ] Final backup completed
- [ ] Deployment started
- [ ] Health checks passed
- [ ] Smoke tests passed
- [ ] Monitoring active
- [ ] Support team on standby

#### T+1 Day
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Address critical issues
- [ ] Status report sent

#### T+7 Days
- [ ] Performance review
- [ ] Issue resolution review
- [ ] User satisfaction survey
- [ ] Post-mortem (if needed)
- [ ] Lessons learned documented

### Go-Live Communication Plan

#### Internal Communication
- **T-7**: Project team briefing
- **T-3**: All-hands announcement
- **T-1**: Final reminder
- **T-0**: Go-live notification
- **T+1**: Status update

#### External Communication
- **T-7**: Customer notification (if breaking changes)
- **T-1**: Maintenance window announcement
- **T-0**: Release announcement
- **T+1**: Success confirmation

### Go-Live Metrics

#### Success Criteria
- **Availability**: >99.9%
- **Error Rate**: <1%
- **Response Time**: <500ms (p95)
- **User Satisfaction**: >4/5
- **Critical Issues**: 0

#### Monitoring Dashboard
```
┌─────────────────────────────────────────┐
│         Go-Live Dashboard               │
├─────────────────────────────────────────┤
│ Availability:  99.95%  ✓               │
│ Error Rate:    0.5%    ✓               │
│ Response Time: 320ms   ✓               │
│ Active Users:  1,250   ✓               │
│ Open Issues:   2       ✓               │
└─────────────────────────────────────────┘
```

---

## Release Metrics

### Key Performance Indicators (KPIs)

#### Release Velocity
- **Target**: 2 weeks per minor release
- **Actual**: Track per release

#### Defect Density
- **Target**: <1 critical bug per release
- **Actual**: Track per release

#### Mean Time to Recovery (MTTR)
- **Target**: <1 hour
- **Actual**: Track per incident

#### Change Failure Rate
- **Target**: <5%
- **Actual**: Track per quarter

### Release Report Template

```markdown
# Release Report - v1.0.0

## Summary
- Release Date: 2026-03-16
- Duration: 2 weeks
- Team Size: 5 developers

## Metrics
- Stories Completed: 15
- Bug Fixes: 8
- Code Coverage: 85%
- Technical Debt: Low

## Quality
- Production Bugs: 2 (minor)
- Rollbacks: 0
- Hotfixes: 1

## Performance
- Load Time: -10% vs previous
- API Response: -15% vs previous
- Database Queries: -20% vs previous

## Lessons Learned
1. What went well
2. What could improve
3. Action items for next release
```

---

## Version Support Policy

### Support Lifecycle
```
v1.0.0  ─┬─ Active Support (6 months)
         └─ Security Support (12 months)

v0.9.0  ─┬─ End of Life
         └─ No longer supported
```

### Deprecation Policy
- **Notice**: 3 months before deprecation
- **Migration**: Provide migration guide
- **Support**: Security patches during deprecation period

---

## Emergency Hotfix Process

### Hotfix Triggers
- Critical security vulnerability
- Data loss bug
- Service outage
- Compliance issue

### Hotfix Process
```bash
# 1. Create hotfix branch
git checkout -b hotfix/v1.0.1 main

# 2. Fix issue
# Edit files...

# 3. Test
npm test
./scripts/smoke-test.sh

# 4. Deploy
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin --tags
./scripts/deploy-hotfix.sh

# 5. Merge back
git checkout develop
git merge hotfix/v1.0.1
git push origin develop
```

### Hotfix SLA
- **Critical**: <4 hours
- **High**: <24 hours
- **Medium**: <72 hours

---

## Contact

For release management questions:
- **Release Manager**: release-manager@asset-system.com
- **DevOps Team**: devops@asset-system.com
- **Emergency**: oncall@asset-system.com

---

## Appendix

### Release Calendar
| Version | Type | Date | Status |
|---------|------|------|--------|
| v1.0.0 | Major | 2026-03-16 | Released |
| v1.1.0 | Minor | 2026-04-15 | Planned |
| v1.2.0 | Minor | 2026-05-15 | Planned |
| v2.0.0 | Major | 2026-06-15 | Planned |

### Release Team Roles
- **Release Manager**: Overall coordination
- **DevOps Engineer**: Deployment automation
- **QA Lead**: Testing coordination
- **Tech Lead**: Technical approval
- **Product Owner**: Business approval
