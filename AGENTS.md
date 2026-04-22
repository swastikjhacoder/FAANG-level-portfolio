# AGENTS.md

## Purpose
Defines roles, responsibilities, and behavioral expectations for AI agents and contributors.

---

## 1. Principles
- Follow clean architecture boundaries strictly
- No direct DB access outside repository
- Prefer explicitness over magic
- Security-first mindset

---

## 2. Agent Responsibilities

### Code Generation
- Respect existing folder structure
- Avoid tight coupling
- Follow naming conventions

### Security
- Validate all inputs
- Never expose secrets
- Enforce authorization at domain layer

### Refactoring
- Preserve functionality
- Improve modularity

---

## 3. Constraints
- No business logic in controllers
- No DB queries in use cases
- No unsafe mutations

---

## 4. Code Standards
- Descriptive naming
- Separation of concerns
- Small, testable functions

---

## 5. Review Checklist
- [ ] Follows architecture layers
- [ ] Secure by design
- [ ] No duplication
- [ ] Proper error handling

