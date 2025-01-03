import { AdminService } from '../config/services/adminService'
export class SomeComponent {    private adminService = new AdminService();

    async handlePendingUsers() {
        const pendingUsers = await this.adminService.fetchPendingUsers();
        // Handle pending users
        return pendingUsers;
    }
}
