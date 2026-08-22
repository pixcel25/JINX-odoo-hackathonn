import { apiRequest } from "../../../auth/authService";

export type EmployeeProfile = {
  userId: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  title: string;
  department: string;
  company: string;
  manager: string;
  location: string;
  phone: string;
  address: string;
  avatarUrl: string;
};

export async function getProfile(token: string): Promise<EmployeeProfile> {
  const response = await apiRequest<{ profile: EmployeeProfile }>(
    "/hr/profile/",
    token,
  );
  return response.profile;
}

export async function updateProfile(
  token: string,
  values: Pick<EmployeeProfile, "phone" | "address" | "avatarUrl">,
): Promise<EmployeeProfile> {
  const response = await apiRequest<{ profile: EmployeeProfile }>(
    "/hr/profile/",
    token,
    {
      method: "PATCH",
      body: JSON.stringify({
        phone: values.phone,
        address: values.address,
        avatar_url: values.avatarUrl,
      }),
    },
  );
  return response.profile;
}
