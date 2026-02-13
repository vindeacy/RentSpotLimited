import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// Get all applications
export async function getAllApplications(req, res) {
	try {
		const applications = await prisma.application.findMany({
			include: { property: true }
		});
		res.json({ applications });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch applications.' });
	}
}

// Get single application by ID
export async function getApplicationById(req, res) {
	try {
		const { id } = req.params;
		const application = await prisma.application.findUnique({
			where: { id },
			include: { property: true }
		});
		if (!application) return res.status(404).json({ error: 'Application not found.' });
		res.json({ application });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch application.' });
	}
}

// Create application
export async function createApplication(req, res) {
	try {
		const { propertyId, tenantUserId, applicantName, applicantEmail, docs, status } = req.body;
		const application = await prisma.application.create({
			data: { propertyId, tenantUserId, applicantName, applicantEmail, docs, status }
		});
		res.status(201).json({ application });
	} catch (err) {
		res.status(500).json({ error: 'Failed to create application.' });
	}
}

// Update application
export async function updateApplication(req, res) {
	try {
		const { id } = req.params;
		const { applicantName, applicantEmail, docs, status } = req.body;
		const application = await prisma.application.update({
			where: { id },
			data: { applicantName, applicantEmail, docs, status }
		});
		res.json({ application });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update application.' });
	}
}

// Delete application
export async function deleteApplication(req, res) {
	try {
		const { id } = req.params;
		await prisma.application.delete({ where: { id } });
		res.json({ message: 'Application deleted successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete application.' });
	}
}
