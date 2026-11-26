-- Rename legacy kanban statuses to Saved / Applied / Interview / Offer / Rejected ids.
UPDATE "SavedJob" SET status = 'interview' WHERE status = 'interviewing';
UPDATE "SavedJob" SET status = 'offer' WHERE status = 'offered';