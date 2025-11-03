import { Medicine } from '../models/medicineSchema.js';

export const logExpiring = async () => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 30);
    const list = await Medicine.find({ expiryDate: { $lte: cutoff } }).limit(20);
    if (list.length) {
      console.warn('Medicines expiring within 30 days:');
      list.forEach(m => console.warn(`${m.name} (${m._id}) expires ${m.expiryDate}`));
    } else {
      console.log('No medicines expiring within 30 days');
    }
  } catch (err) {
    console.error('Expiry check failed', err);
  }
};
