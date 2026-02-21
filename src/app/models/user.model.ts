export interface Role {
  roleId?: number;
  roleName: string;
  description?: string;
}

export interface UserDTO {
  userId?: number; // Optionnel pour la création, présent pour la liste
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: string;
  siteName?: string;
  isActive?: number;
}
