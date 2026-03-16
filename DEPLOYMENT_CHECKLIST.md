# Deployment Checklist - ระบบงานทะเบียนครุภัณฑ์

## สารบัญ
1. [Pre-Deployment](#pre-deployment)
2. [Deployment Day](#deployment-day)
3. [Post-Deployment](#post-deployment)
4. [Go-Live](#go-live)
5. [Emergency Contacts](#emergency-contacts)

---

## Pre-Deployment

### T-14 Days (Two Weeks Before)

#### Planning
- [ ] Release scope defined
- [ ] Timeline confirmed
- [ ] Resource allocation completed
- [ ] Risk assessment done
- [ ] Stakeholders identified

#### Development
- [ ] Feature development complete
- [ ] Code review completed
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] E2E tests written

#### Documentation
- [ ] Technical documentation updated
- [ ] User documentation drafted
- [ ] API documentation updated
- [ ] Release notes drafted

---

### T-7 Days (One Week Before)

#### Testing
- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Performance tests completed
- [ ] Security scan completed
- [ ] Accessibility tests completed

#### Code Quality
- [ ] No critical code smells
- [ ] No critical vulnerabilities
- [ ] Technical debt reviewed
- [ ] SonarQube gate passed

#### Infrastructure
- [ ] Staging environment ready
- [ ] Production environment ready
- [ ] SSL certificates valid
- [ ] DNS records configured
- [ ] Firewall rules configured

#### Team Readiness
- [ ] Development team briefed
- [ ] QA team briefed
- [ ] DevOps team briefed
- [ ] Support team briefed
- [ ] On-call schedule confirmed

---

### T-3 Days

#### Final Testing
- [ ] Regression testing completed
- [ ] User acceptance testing (UAT) started
- [ ] Performance benchmarks met
- [ ] Load testing completed
- [ ] Security penetration testing completed

#### Backup Strategy
- [ ] Backup scripts tested
- [ ] Restore scripts tested
- [ ] Backup retention policy confirmed
- [ ] Off-site backup configured

#### Rollback Plan
- [ ] Rollback procedure documented
- [ ] Rollback tested in staging
- [ ] Rollback time < 1 hour
- [ ] Database rollback tested

#### Monitoring
- [ ] Prometheus dashboards configured
- [ ] Grafana alerts configured
- [ ] ELK stack logging configured
- [ ] Health checks configured
- [ ] On-call rotation confirmed

---

### T-1 Day

#### Final Checks
- [ ] Code freeze implemented
- [ ] No new commits allowed
- [ ] Final build created
- [ ] Build tagged (v1.0.0)
- [ ] Images pushed to registry

#### Communication
- [ ] Maintenance window announced
- [ ] Stakeholders notified
- [ ] Support team on standby
- [ ] Escalation path confirmed

#### Environment Prep
- [ ] Production server updated
- [ ] Dependencies installed
- [ ] Disk space verified (>50GB free)
- [ ] Memory verified (>8GB free)
- [ ] Network connectivity tested

#### Backup
- [ ] Full database backup completed
- [ ] Config files backed up
- [ ] Application backup completed
- [ ] Backup verified

---

## Deployment Day

### T-0 (Deployment Start)

#### Pre-Deployment Verification
- [ ] Team assembled (Dev, QA, DevOps, Support)
- [ ] Communication channel open (Slack/Teams)
- [ ] Monitoring dashboards open
- [ ] Rollback plan reviewed
- [ ] Emergency contacts available

#### Deployment Steps
- [ ] Stop current services
  ```bash
  docker-compose down
  ```
- [ ] Pull new images
  ```bash
  docker-compose pull
  ```
- [ ] Start new services
  ```bash
  docker-compose up -d
  ```
- [ ] Run database migrations
  ```bash
  docker-compose exec backend npm run db:migrate
  ```
- [ ] Verify services running
  ```bash
  docker-compose ps
  ```

#### Health Checks
- [ ] Backend health check passed
  ```bash
  curl http://localhost:3000/health
  ```
- [ ] Frontend health check passed
  ```bash
  curl http://localhost:80/
  ```
- [ ] Database health check passed
  ```bash
  docker exec asset_db pg_isready
  ```
- [ ] Redis health check passed
  ```bash
  docker exec asset_redis redis-cli ping
  ```

#### Smoke Tests
- [ ] Login functionality works
- [ ] Dashboard loads
- [ ] Asset list displays
- [ ] Create asset works
- [ ] Search works
- [ ] Reports generate
- [ ] Export works

---

### T+1 Hour (Post-Deployment)

#### Monitoring
- [ ] Error rate < 1%
- [ ] Response time < 500ms
- [ ] Memory usage < 80%
- [ ] CPU usage < 70%
- [ ] Database connections stable
- [ ] No unusual log patterns

#### Functional Verification
- [ ] All critical features working
- [ ] User authentication working
- [ ] Data integrity verified
- [ ] No data loss detected
- [ ] File uploads working
- [ ] Email notifications working

#### Performance
- [ ] Page load time acceptable
- [ ] API response time acceptable
- [ ] Database query time acceptable
- [ ] No timeout errors
- [ ] No memory leaks

#### User Feedback
- [ ] Initial user feedback collected
- [ ] No critical issues reported
- [ ] Support tickets normal
- [ ] Social sentiment positive

---

### T+4 Hours

#### Extended Monitoring
- [ ] Metrics stable for 4 hours
- [ ] No error spikes
- [ ] No performance degradation
- [ ] User activity normal
- [ ] System resources stable

#### Team Status
- [ ] Development team on standby
- [ ] QA team monitoring
- [ ] DevOps team monitoring
- [ ] Support team active
- [ ] On-call engineer available

---

### T+24 Hours

#### Day-After Review
- [ ] Overnight monitoring passed
- [ ] Morning traffic handled well
- [ ] No critical incidents
- [ ] User adoption normal
- [ ] Performance benchmarks met

#### Status Report
- [ ] Deployment success confirmed
- [ ] Metrics report generated
- [ ] Issue log reviewed
- [ ] Stakeholders updated
- [ ] Team debrief scheduled

---

## Post-Deployment

### T+1 Day

#### Documentation
- [ ] Deployment report written
- [ ] Lessons learned documented
- [ ] Runbook updated
- [ ] Known issues documented
- [ ] Support documentation updated

#### Cleanup
- [ ] Old images archived
- [ ] Temporary files cleaned
- [ ] Old containers removed
- [ ] Old volumes archived
- [ ] Disk space reclaimed

#### Monitoring Review
- [ ] Alert thresholds adjusted
- [ ] Dashboards updated
- [ ] Log retention configured
- [ ] Backup schedule confirmed
- [ ] On-call schedule updated

---

### T+3 Days

#### Stability Review
- [ ] 3-day metrics reviewed
- [ ] Error trends analyzed
- [ ] Performance trends analyzed
- [ ] User feedback analyzed
- [ ] Support tickets reviewed

#### Optimization
- [ ] Performance bottlenecks identified
- [ ] Optimization plan created
- [ ] Technical debt logged
- [ ] Improvement backlog updated

---

### T+7 Days

#### Post-Mortem (If Needed)
- [ ] Incident review (if any)
- [ ] Root cause analysis
- [ ] Corrective actions defined
- [ ] Preventive measures planned
- [ ] Process improvements identified

#### Success Review
- [ ] Success criteria met
- [ ] KPIs reviewed
- [ ] ROI calculated
- [ ] User satisfaction measured
- [ ] Team performance reviewed

#### Planning Next Release
- [ ] Next release scope defined
- [ ] Timeline estimated
- [ ] Resource planning started
- [ ] Backlog prioritized
- [ ] Sprint planning scheduled

---

## Go-Live

### Go/No-Go Decision

#### Go Criteria
All must be true:
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security scan clean
- [ ] UAT signed off
- [ ] Stakeholders approved
- [ ] Support team ready
- [ ] Rollback plan tested
- [ ] Monitoring configured

#### No-Go Triggers
Any one triggers No-Go:
- [ ] Critical bug found
- [ ] Performance below threshold
- [ ] Security vulnerability found
- [ ] UAT failed
- [ ] Infrastructure not ready
- [ ] Team not ready
- [ ] Data migration failed

### Go-Live Approval

#### Signatures Required
- [ ] Product Owner: _________________ Date: _______
- [ ] Tech Lead: _____________________ Date: _______
- [ ] QA Lead: _______________________ Date: _______
- [ ] DevOps Lead: ___________________ Date: _______
- [ ] Security Lead: _________________ Date: _______
- [ ] Business Sponsor: ______________ Date: _______

---

## Emergency Contacts

### Primary Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Project Manager | [Name] | +66-XXX-XXX-XXXX | pm@asset-system.com |
| Tech Lead | [Name] | +66-XXX-XXX-XXXX | tech-lead@asset-system.com |
| DevOps Lead | [Name] | +66-XXX-XXX-XXXX | devops@asset-system.com |
| QA Lead | [Name] | +66-XXX-XXX-XXXX | qa@asset-system.com |
| Support Lead | [Name] | +66-XXX-XXX-XXXX | support@asset-system.com |

### Escalation Path

#### Level 1: On-Call Engineer
- **Contact**: oncall@asset-system.com
- **Phone**: +66-XXX-XXX-XXXX
- **Response Time**: < 15 minutes

#### Level 2: Tech Lead
- **Contact**: tech-lead@asset-system.com
- **Phone**: +66-XXX-XXX-XXXX
- **Response Time**: < 30 minutes

#### Level 3: Project Manager
- **Contact**: pm@asset-system.com
- **Phone**: +66-XXX-XXX-XXXX
- **Response Time**: < 1 hour

#### Level 4: Business Sponsor
- **Contact**: sponsor@asset-system.com
- **Phone**: +66-XXX-XXX-XXXX
- **Response Time**: < 2 hours

### Emergency Procedures

#### Service Outage
1. Page on-call engineer
2. Assess impact
3. Initiate rollback if needed
4. Communicate to stakeholders
5. Post-mortem after resolution

#### Data Loss
1. Page on-call engineer + Tech Lead
2. Stop all writes
3. Restore from backup
4. Verify data integrity
5. Communicate to stakeholders
6. Post-mortem after resolution

#### Security Breach
1. Page Security Lead + Tech Lead
2. Isolate affected systems
3. Engage security team
4. Preserve evidence
5. Notify stakeholders
6. Post-mortem after resolution

---

## Appendix

### Deployment Commands Quick Reference

```bash
# Pre-deployment backup
./scripts/backup.sh

# Stop services
docker-compose down

# Pull new images
docker-compose pull

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run db:migrate

# Health checks
curl http://localhost:3000/health
curl http://localhost:80/
docker exec asset_db pg_isready
docker exec asset_redis redis-cli ping

# View logs
docker-compose logs -f

# Rollback
git checkout <previous-tag>
docker-compose down
docker-compose up -d
docker-compose exec backend npm run db:rollback
```

### Monitoring URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:80 | N/A |
| Backend API | http://localhost:3000 | N/A |
| Grafana | http://localhost:3001 | admin/admin123 |
| Prometheus | http://localhost:9090 | N/A |
| Kibana | http://localhost:5601 | N/A |
| pgAdmin | http://localhost:5050 | assetuser/assetpass123 |

### Key Metrics Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| CPU Usage | >70% | >90% |
| Memory Usage | >80% | >95% |
| Disk Usage | >80% | >90% |
| Error Rate | >2% | >5% |
| Response Time (p95) | >500ms | >1000ms |
| Database Connections | >80% | >95% |

---

## Checklist Completion

### Sign-Off

**Deployment Completed Successfully:**

- **Deployed By**: _________________ Date: _______ Time: _______
- **Verified By**: _________________ Date: _______ Time: _______
- **Approved By**: _________________ Date: _______ Time: _______

**Deployment Status:**
- [ ] Successful
- [ ] Successful with Issues
- [ ] Rolled Back
- [ ] Failed

**Notes:**
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

**Version**: 1.0.0  
**Last Updated**: 2026-03-16  
**Owner**: DevOps Team
