import { userRepository } from '../repositories/user.repository.js';

export const userService = {
  listForAdmin() {
    return userRepository.findManySummary();
  },
};
