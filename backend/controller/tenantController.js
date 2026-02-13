import db from '../lib/db.js';

// Get all tenants
export async function getAllTenants(req, res) {
  try {
    const tenants = await db.tenant.findMany({
      include: { 
        user: {
          select: { id: true, name: true, email: true, phone: true, isActive: true }
        }, 
        leases: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ tenants });
  } catch (err) {
    console.error('Get all tenants error:', err);
    res.status(500).json({ error: 'Failed to fetch tenants.' });
  }
}

// Get single tenant by ID
export async function getTenantById(req, res) {
  try {
    const { id } = req.params;
    const tenant = await db.tenant.findUnique({
      where: { id },
      include: { user: true, leases: true }
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });
    res.json({ tenant });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenant.' });
  }
}

/**
 * CREATE TENANT
 * Logic: 
 * 1. Takes email/name/phone from the form.
 * 2. Checks if a User exists with that email.
 * 3. If not, creates the User first.
 * 4. Creates the Tenant profile linked to that User.
 */
export async function createTenant(req, res) {
  try {
    const { 
      email, 
      name, 
      phone, 
      employmentStatus, 
      dob, 
      moveInDate, 
      kraPin,
      idDocUrl 
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required to create a tenant.' });
    }

    // 1. Check if user exists by email (to avoid the 'undefined id' error)
    let user = await db.user.findUnique({ where: { email } });

    // 2. If user doesn't exist, create the base User account
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: name || null,
          phone: phone || null,
          role: 'tenant',
          passwordHash: 'change_me_later', // Default password for new entries
          isActive: true,
          isVerified: false
        }
      });
    }

    // 3. Check if this user already has a tenant profile
    const existingTenant = await db.tenant.findUnique({ where: { userId: user.id } });
    if (existingTenant) {
      return res.status(400).json({ error: 'This user already has a tenant profile.' });
    }

    // 4. Create the Tenant profile
    const tenant = await db.tenant.create({
      data: {
        userId: user.id,
        employmentStatus: employmentStatus || 'Employed',
        kraPin: kraPin || null,
        dob: dob ? new Date(dob) : null,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        idDocUrl: idDocUrl || null,
        rating: 0,
        verified: false
      },
      include: {
        user: true
      }
    });

    res.status(201).json({ success: true, tenant });
  } catch (err) {
    console.error('Create tenant error:', err);
    res.status(500).json({ error: err.message || 'Failed to create tenant.' });
  }
}

// Update tenant
export async function updateTenant(req, res) {
  try {
    const { id } = req.params;
    const { dob, idDocUrl, employmentStatus, verified } = req.body;
    
    const tenant = await db.tenant.update({
      where: { id },
      data: { 
        ...(dob && { dob: new Date(dob) }), 
        ...(idDocUrl && { idDocUrl }),
        ...(employmentStatus && { employmentStatus }),
        ...(verified !== undefined && { verified })
      },
      include: { user: true }
    });
    res.json({ success: true, tenant });
  } catch (err) {
    console.error('Update tenant error:', err);
    res.status(500).json({ error: 'Failed to update tenant.' });
  }
}

// Delete tenant
export async function deleteTenant(req, res) {
  try {
    const { id } = req.params;
    // Note: This deletes the profile but keeps the User account
    await db.tenant.delete({ where: { id } });
    res.json({ success: true, message: 'Tenant profile deleted successfully.' });
  } catch (err) {
    console.error('Delete tenant error:', err);
    res.status(500).json({ error: 'Failed to delete tenant.' });
  }
}