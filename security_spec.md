# QueueMate Security Specification & "Dirty Dozen" Hardening

This document establishes the Attribute-Based Access Control (ABAC), data integrity invariants, and adversary payload test cases for the QueueMate Firestore Security architecture.

## 1. System Invariants & Access Control Policy

1. **Authentication Requirement**: Any state-mutating operation (create, update, delete) requires `request.auth != null`.
2. **Business Multi-Tenant Isolation**: Every `tokens`, `businesses`, and `activities` document carries an `ownerId` corresponding to the creating authenticated operator (`request.auth.uid`). Users cannot read or manipulate documents belonging to another business.
3. **Atomic Sequential Counters**: Daily counters are strictly scoped to the business identifier and date stamp (`counters/{businessId}_{YYYY-MM-DD}`).
4. **Customer Display Public Read Access**: To enable unauthenticated waiting hall screens / kiosk TVs to stream the current serving token without requiring operators to sign in on public hardware, read access to `businesses/{businessId}` and `tokens/{tokenId}` allows query filtering by `businessId`. All write, update, and delete privileges remain locked to the verified owner.
5. **Immutable Timestamps & Keys**: `ownerId`, `businessId`, and `createdAt` are immutable once written.

---

## 2. The "Dirty Dozen" Adversary Payloads

The following 12 test payloads represent penetration tests against the Firestore Security Model. Each must return `PERMISSION_DENIED`:

### Test 1: Identity Spoofing on User Registration
- **Target**: `setDoc(doc(db, 'users', 'victim_uid'), { ... })`
- **Payload**: Attempting to write a user document where the document ID does not match `request.auth.uid`.
- **Expected**: `PERMISSION_DENIED`

### Test 2: Foreign Business Record Injection
- **Target**: `addDoc(collection(db, 'businesses'), { ownerId: 'other_user_id', ... })`
- **Payload**: Attempting to create a business with an `ownerId` different from the authenticated user.
- **Expected**: `PERMISSION_DENIED`

### Test 3: Unauthorized Token Status Modification
- **Target**: `updateDoc(doc(db, 'tokens', 'bizA_token_1'), { status: 'completed' })`
- **Actor**: Operator B (UID `attacker_uid`)
- **Payload**: Attempting to advance or complete a customer ticket belonging to Business A.
- **Expected**: `PERMISSION_DENIED`

### Test 4: Shadow Key Injection (Ghost Fields)
- **Target**: `updateDoc(doc(db, 'businesses', 'biz_123'), { name: 'Valid Name', isAdmin: true, bypassBilling: true })`
- **Payload**: Adding unapproved keys outside the permitted entity schema.
- **Expected**: `PERMISSION_DENIED`

### Test 5: Denial-of-Wallet String Bomb (Resource Exhaustion)
- **Target**: `addDoc(collection(db, 'tokens'), { customerName: 'A'.repeat(500000), ... })`
- **Payload**: 500KB customer name string aiming to inflate Firestore storage and bandwidth costs.
- **Expected**: `PERMISSION_DENIED` (enforced by `maxLength: 100` and validation helper).

### Test 6: ID Poisoning via Path Malformation
- **Target**: `setDoc(doc(db, 'counters', '../../../etc/passwd'), { ... })`
- **Payload**: Directory traversal or non-alphanumeric characters in path variables.
- **Expected**: `PERMISSION_DENIED`

### Test 7: Counter Number Decrement Attack
- **Target**: `setDoc(doc(db, 'counters', 'biz_2026-11-03'), { lastSequenceNumber: -50 })`
- **Payload**: Negative or rolled-back counter sequence to corrupt queue order.
- **Expected**: `PERMISSION_DENIED`

### Test 8: Modifying Immortal Creation Timestamp
- **Target**: `updateDoc(doc(db, 'tokens', 'token_1'), { createdAt: 0 })`
- **Payload**: Altering the original creation timestamp to artificially tamper with wait duration analytics.
- **Expected**: `PERMISSION_DENIED`

### Test 9: Unauthenticated Token Cancellation
- **Target**: `updateDoc(doc(db, 'tokens', 'token_1'), { status: 'cancelled' })`
- **Actor**: Anonymous unauthenticated visitor.
- **Payload**: Attempting to cancel an in-flight token from the public display view.
- **Expected**: `PERMISSION_DENIED`

### Test 10: Cross-Tenant User Profile Snooping
- **Target**: `getDoc(doc(db, 'users', 'competitor_uid'))`
- **Actor**: Operator B
- **Payload**: Attempting to read another operator's private profile details.
- **Expected**: `PERMISSION_DENIED`

### Test 11: Invalid Status State Injection
- **Target**: `updateDoc(doc(db, 'tokens', 'token_1'), { status: 'VIP_UNLIMITED_PASS' })`
- **Payload**: Non-enum value injected into the `status` field.
- **Expected**: `PERMISSION_DENIED`

### Test 12: Business Ownership Hijack
- **Target**: `updateDoc(doc(db, 'businesses', 'biz_1'), { ownerId: 'attacker_uid' })`
- **Payload**: Overwriting the `ownerId` field during a business profile update.
- **Expected**: `PERMISSION_DENIED`
