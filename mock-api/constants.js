const VALID_SERVICE_STATUSES = ['pending', 'confirmed', 'assigned', 'completed', 'cancelled'];
const VALID_SERVICE_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const VALID_TECHNICIAN_STATUSES = ['available', 'busy', 'offline', 'inactive'];
const ACTIVE_SERVICE_REQUEST_STATUSES = ['assigned'];

module.exports = {
  VALID_SERVICE_STATUSES,
  VALID_SERVICE_PRIORITIES,
  VALID_TECHNICIAN_STATUSES,
  ACTIVE_SERVICE_REQUEST_STATUSES,
};
