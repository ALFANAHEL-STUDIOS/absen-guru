"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, PlusCircle, Edit, Trash2, Loader2, Mail, User as UserIcon, Lock, UserPlus, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
  createdAt?: any;
}
export default function UserManagement() {
  const {
    userRole,
    schoolId
  } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher' // Default role
  });
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== 'admin') {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.push('/dashboard');
      return; // Early return to prevent hooks from running after redirect
    }
  }, [userRole, router]);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const {
          userApi
        } = await import('@/lib/api');
        let usersData: UserData[] = [];
        if (schoolId) {
          // Fetch users belonging to the school
          usersData = (await userApi.getBySchool(schoolId)) as UserData[];
        }
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Gagal mengambil data pengguna');
      } finally {
        setLoading(false);
      }
    };
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole, schoolId]);
  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'teacher'
    });
    setShowAddModal(true);
  };
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      // Don't set password when editing
      role: user.role
    });
    setShowEditModal(true);
  };
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }
    try {
      const {
        auth
      } = await import('@/lib/firebase');
      const {
        userApi
      } = await import('@/lib/api');

      // Delete user from Firebase Authentication and Firestore
      await userApi.delete(userId);

      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      toast.success('Pengguna berhasil dihapus');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus pengguna');
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleSubmitAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) {
      toast.error('Tidak dapat mengakses data sekolah');
      return;
    }
    try {
      setFormLoading(true);

      // Import Firebase functions and create user
      const {
        createUserWithEmailAndPassword,
        getAuth
      } = await import('firebase/auth');
      const {
        doc,
        setDoc
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');
      const {
        serverTimestamp
      } = await import('firebase/firestore');
      const auth = getAuth();

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        schoolId,
        createdAt: serverTimestamp()
      });

      // Add the new user to local state
      setUsers([...users, {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        schoolId
      }]);
      setShowAddModal(false);
      toast.success('Pengguna berhasil ditambahkan');
    } catch (error: any) {
      console.error('Error adding user:', error);
      let errorMessage = 'Gagal menambahkan pengguna';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah digunakan';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah';
      }
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };
  const handleSubmitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      return;
    }
    try {
      setFormLoading(true);
      const {
        userApi
      } = await import('@/lib/api');

      // Update user data
      await userApi.update(selectedUser.id, {
        name: formData.name,
        role: formData.role
      });

      // Update local state
      setUsers(users.map(user => user.id === selectedUser.id ? {
        ...user,
        name: formData.name,
        role: formData.role
      } : user));
      setShowEditModal(false);
      toast.success('Pengguna berhasil diperbarui');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Gagal memperbarui pengguna');
    } finally {
      setFormLoading(false);
    }
  };
  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="pb-20 md:pb-6" data-unique-id="e286e42c-1819-4298-877c-9bc16258e441" data-file-name="app/dashboard/user-management/page.tsx" data-dynamic-text="true">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6" data-unique-id="a297bbc7-4957-4514-b050-e49d8f371836" data-file-name="app/dashboard/user-management/page.tsx">
        <div className="flex items-center mb-4 md:mb-0" data-unique-id="809f2268-7d20-48e9-b512-ae944ac867cd" data-file-name="app/dashboard/user-management/page.tsx">
          <Users className="h-7 w-7 text-primary mr-3" />
          <h1 className="text-2xl font-bold text-gray-800" data-unique-id="fdaced23-f86e-4e5b-8245-4900807776d8" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="f1c2999e-b0f7-42b1-ac1c-ef3feeac3ddc" data-file-name="app/dashboard/user-management/page.tsx">Manajemen Pengguna</span></h1>
        </div>
        
        <button onClick={handleAddUser} className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-orange-500 transition-colors shadow-sm" data-unique-id="3ca8187a-49ce-4f7f-b97e-95d437f4c523" data-file-name="app/dashboard/user-management/page.tsx">
          <UserPlus size={18} /><span className="editable-text" data-unique-id="98cc847d-2817-4b67-9f5b-184036a7d072" data-file-name="app/dashboard/user-management/page.tsx">
          Tambah Pengguna
        </span></button>
      </div>

      {/* Search bar */}
      <div className="mb-6" data-unique-id="91847eaa-c4c1-4f0b-9b96-d8d41f689078" data-file-name="app/dashboard/user-management/page.tsx">
        <div className="relative" data-unique-id="27e9b3a2-cd0b-42e5-8772-63b2654adef1" data-file-name="app/dashboard/user-management/page.tsx">
          <input type="text" placeholder="Cari pengguna berdasarkan nama atau email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" data-unique-id="34a91feb-e65b-4fd9-8f26-c1354cb13096" data-file-name="app/dashboard/user-management/page.tsx" />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-unique-id="0c283698-177b-42a6-82e7-30c9825ac819" data-file-name="app/dashboard/user-management/page.tsx">
            <UserIcon size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      {loading ? <div className="flex justify-center items-center h-64" data-unique-id="84aa81ea-908d-44cd-9d8a-425585afd2d5" data-file-name="app/dashboard/user-management/page.tsx">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div> : filteredUsers.length > 0 ? <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-unique-id="345a2315-cac9-4ac1-b389-9a7c84fa77b2" data-file-name="app/dashboard/user-management/page.tsx">
          <div className="overflow-x-auto" data-unique-id="d5dc67ab-0a98-43d3-809f-d032a6d0dcca" data-file-name="app/dashboard/user-management/page.tsx">
            <table className="w-full" data-unique-id="f57e4765-1e72-4399-82b6-6b768225e925" data-file-name="app/dashboard/user-management/page.tsx">
              <thead className="bg-gray-50" data-unique-id="0a51ccbf-d337-49a2-a309-e503236e7023" data-file-name="app/dashboard/user-management/page.tsx">
                <tr data-unique-id="9ab6bd97-ec4c-4a4e-829e-ce64a5a0e9b6" data-file-name="app/dashboard/user-management/page.tsx">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="0856a2cc-b312-420f-9522-f59607317cd3" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="8d5ff555-a233-4c06-841f-229b92c8a1ea" data-file-name="app/dashboard/user-management/page.tsx">Nama</span></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="d3a50b6e-fd89-4b7e-9cc1-421ed97a4526" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="d1626e9b-297c-47f1-95d3-19065a074e27" data-file-name="app/dashboard/user-management/page.tsx">Email</span></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="0731631c-a7c2-4905-b42b-a9bbdd64a90c" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="c67640b5-9133-4cf5-a90c-2d87e3cba385" data-file-name="app/dashboard/user-management/page.tsx">Hak Akses</span></th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="cebd489c-0643-4b85-b9e0-ea880bd8ca30" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="fb7f162c-3507-498b-881b-6b4aa975add0" data-file-name="app/dashboard/user-management/page.tsx">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200" data-unique-id="fe612350-1036-44a3-9516-8da9a0378835" data-file-name="app/dashboard/user-management/page.tsx" data-dynamic-text="true">
                {filteredUsers.map(user => <tr key={user.id} className="hover:bg-gray-50" data-unique-id="82777e71-7b90-479c-a832-cf83fc7b68e9" data-file-name="app/dashboard/user-management/page.tsx">
                    <td className="px-6 py-4 whitespace-nowrap" data-unique-id="a29349a2-1636-476c-bf51-6e2c200cfb67" data-file-name="app/dashboard/user-management/page.tsx">
                      <div className="flex items-center" data-unique-id="a3ad051c-b74f-47fc-99d5-484dc8a1c216" data-file-name="app/dashboard/user-management/page.tsx">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium" data-unique-id="8d9380b0-9931-4b59-a9b2-abaa2838d0d9" data-file-name="app/dashboard/user-management/page.tsx" data-dynamic-text="true">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4" data-unique-id="c1871d0b-d29e-4fd6-9293-f96d96410c25" data-file-name="app/dashboard/user-management/page.tsx">
                          <div className="text-sm font-medium text-gray-900" data-unique-id="09e64668-3154-48f2-8d1f-1080139a7054" data-file-name="app/dashboard/user-management/page.tsx" data-dynamic-text="true">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-unique-id="38567bfa-fb54-4028-a2ab-ecffcdb87463" data-file-name="app/dashboard/user-management/page.tsx">
                      <div className="text-sm text-gray-500" data-unique-id="fdef01ad-a09f-446b-8171-ce98e0f7cab6" data-file-name="app/dashboard/user-management/page.tsx" data-dynamic-text="true">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-unique-id="bcb7c687-e45f-4afc-8953-d98e641066e5" data-file-name="app/dashboard/user-management/page.tsx">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                        ${user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : ''}
                        ${user.role === 'student' ? 'bg-green-100 text-green-800' : ''}
                      `} data-unique-id="b34cec32-81e9-41a0-89b8-8c107b333205" data-file-name="app/dashboard/user-management/page.tsx" data-dynamic-text="true">
                        {user.role === 'admin' ? 'Administrator' : user.role === 'teacher' ? 'Guru' : 'Siswa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" data-unique-id="7c18f115-4b99-407a-b9ff-7f04c1b488b8" data-file-name="app/dashboard/user-management/page.tsx">
                      <div className="flex justify-end gap-2" data-unique-id="0bd557f7-e835-44ec-8f32-65e0ed3b58d7" data-file-name="app/dashboard/user-management/page.tsx">
                        <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50" title="Edit pengguna" data-unique-id="49bcfe13-2109-4869-ab86-63fe2cf367ba" data-file-name="app/dashboard/user-management/page.tsx">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50" title="Hapus pengguna" data-unique-id="e0b50e05-42ef-4a3d-b16e-23ea4f6be302" data-file-name="app/dashboard/user-management/page.tsx">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div> : <div className="bg-white rounded-xl shadow-sm p-10 text-center" data-unique-id="d6b5fedf-2cf6-4af0-9ab1-20ca411f0fcb" data-file-name="app/dashboard/user-management/page.tsx">
          <div className="flex flex-col items-center" data-unique-id="6c7a9437-3739-49bd-b699-c50514e71be6" data-file-name="app/dashboard/user-management/page.tsx">
            <div className="bg-gray-100 rounded-full p-3 mb-4" data-unique-id="4006370c-3d30-4b82-8060-477af388afb1" data-file-name="app/dashboard/user-management/page.tsx">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4" data-unique-id="8a58f14b-ac59-401b-af4b-174dcd581c7c" data-file-name="app/dashboard/user-management/page.tsx" data-dynamic-text="true">
              {searchQuery ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Belum ada data pengguna'}
            </p>
            <button onClick={handleAddUser} className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors" data-unique-id="2c82b4f4-9db4-4c57-9d3e-2ee0fb2c3dda" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="4d6860b1-96ea-412a-8b54-9a0441a8a7a7" data-file-name="app/dashboard/user-management/page.tsx">
              Tambah Pengguna
            </span></button>
          </div>
        </div>}

      {/* Add User Modal */}
      {showAddModal && <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4" data-unique-id="898558cc-96ee-4866-b721-25c102204b87" data-file-name="app/dashboard/user-management/page.tsx">
          <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} className="bg-white rounded-xl shadow-lg max-w-md w-full p-6" data-unique-id="4e45f01c-aa7d-4f21-b724-65ef72064f11" data-file-name="app/dashboard/user-management/page.tsx">
            <div className="flex justify-between items-center mb-4" data-unique-id="3d87df41-1ce2-4fda-ac10-e74fc0036246" data-file-name="app/dashboard/user-management/page.tsx">
              <h3 className="text-xl font-bold text-gray-800 flex items-center" data-unique-id="96288048-8dc6-42f4-84a3-ab943647e0c7" data-file-name="app/dashboard/user-management/page.tsx">
                <UserPlus className="mr-2 h-5 w-5 text-primary" /><span className="editable-text" data-unique-id="da5bc772-ac61-4204-8080-66061a02cb7c" data-file-name="app/dashboard/user-management/page.tsx">
                Tambah Pengguna Baru
              </span></h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700" data-unique-id="94d0ebcb-d1d6-463f-9475-0644d4b1a04f" data-file-name="app/dashboard/user-management/page.tsx">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAddUser} data-unique-id="aaf6d7b0-4b11-43b0-85e3-7734c090a3c8" data-file-name="app/dashboard/user-management/page.tsx">
              <div className="space-y-4" data-unique-id="a8a5be1f-3d77-4ac7-b588-9363655d0d30" data-file-name="app/dashboard/user-management/page.tsx">
                <div data-unique-id="25df21e6-6824-4c55-bbc6-66a62cea519a" data-file-name="app/dashboard/user-management/page.tsx">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="114bbeeb-59d9-433a-8406-74d2677c4967" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="b77d3e1f-bf5f-405b-b957-e70a44453d77" data-file-name="app/dashboard/user-management/page.tsx">
                    Nama Lengkap
                  </span></label>
                  <input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Masukkan nama lengkap" data-unique-id="491e16c6-ec19-4ace-ab55-df86ca6a9c45" data-file-name="app/dashboard/user-management/page.tsx" />
                </div>
                
                <div data-unique-id="de926b2d-9cf1-41f0-bbc0-227df05677a9" data-file-name="app/dashboard/user-management/page.tsx">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="33738b64-0d64-4586-9ef6-3eac79962625" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="9e159ac8-068e-473c-9161-3abef679e392" data-file-name="app/dashboard/user-management/page.tsx">
                    Email
                  </span></label>
                  <div className="relative" data-unique-id="b6ff7157-0515-4ef9-a5d3-03545456a7a1" data-file-name="app/dashboard/user-management/page.tsx">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Masukkan E-mail" data-unique-id="b7b9f713-0479-4b3c-bbe6-475b2205438c" data-file-name="app/dashboard/user-management/page.tsx" />
                  </div>
                </div>
                
                <div data-unique-id="21b9c401-30d2-48f7-b926-28d2f7252f5a" data-file-name="app/dashboard/user-management/page.tsx">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="1ae8a83e-2023-4f5f-be6c-618f4cd69926" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="3210c5a5-4474-4c7e-9ac6-aaa1361363aa" data-file-name="app/dashboard/user-management/page.tsx">
                    Password
                  </span></label>
                  <div className="relative" data-unique-id="146f3993-9b8e-4239-89d8-cb193c9e3a5f" data-file-name="app/dashboard/user-management/page.tsx">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input id="password" name="password" type="password" required value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Masukkan password" data-unique-id="91b128e5-64f3-47f9-9937-7043c0e3882c" data-file-name="app/dashboard/user-management/page.tsx" />
                  </div>
                </div>
                
                <div data-unique-id="c845473c-95d7-459a-ad16-1783bf206221" data-file-name="app/dashboard/user-management/page.tsx">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="142c252e-6b44-45ef-9372-f371ab0bf46b" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="caa025e0-e2f4-4f23-8b50-c0260fb6d2ad" data-file-name="app/dashboard/user-management/page.tsx">
                    Hak Akses
                  </span></label>
                  <select id="role" name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" required data-unique-id="65f45105-43d8-49f6-90ab-6d0a0b46c9b6" data-file-name="app/dashboard/user-management/page.tsx">
                    <option value="admin" data-unique-id="1b26f934-de2e-43ef-ac98-4725c86a2eb3" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="45d55c3a-aae2-4f81-a034-84218ac54c9e" data-file-name="app/dashboard/user-management/page.tsx">Administrator</span></option>
                    <option value="teacher" data-unique-id="f16dda75-6923-4b2d-87eb-d02dcce4f651" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="ff2f48e6-f04d-43ec-ab27-c65f0ed819ac" data-file-name="app/dashboard/user-management/page.tsx">Guru</span></option>
                    <option value="student" data-unique-id="67e0e10d-a550-4a41-afde-d655279332b3" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="827be41a-b78a-4ac7-9ce4-6b86afb99079" data-file-name="app/dashboard/user-management/page.tsx">Siswa</span></option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end" data-unique-id="1baf597a-eb59-492b-a225-84f7ee7af9ec" data-file-name="app/dashboard/user-management/page.tsx">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-50" data-unique-id="6d14c016-f591-4966-b5b5-c973f4579869" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="2477f6fb-7cf5-4326-bb03-dfc66c597e30" data-file-name="app/dashboard/user-management/page.tsx">
                  Batal
                </span></button>
                
                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2" data-unique-id="3e440229-16b7-485a-9b2b-2ae31b643b0d" data-file-name="app/dashboard/user-management/page.tsx" data-dynamic-text="true">
                  {formLoading ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <UserPlus size={16} />}
                  {formLoading ? "Menambahkan..." : "Tambah Pengguna"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4" data-unique-id="6c1d0064-095a-495c-b88d-2d1e28c0bd66" data-file-name="app/dashboard/user-management/page.tsx">
          <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} className="bg-white rounded-xl shadow-lg max-w-md w-full p-6" data-unique-id="b025a06b-a734-4315-a48f-4394625db9eb" data-file-name="app/dashboard/user-management/page.tsx">
            <div className="flex justify-between items-center mb-4" data-unique-id="e6d4cb88-1478-44cb-a4ce-3ca8e03c170d" data-file-name="app/dashboard/user-management/page.tsx">
              <h3 className="text-xl font-bold text-gray-800 flex items-center" data-unique-id="07481edf-9f42-4b54-8543-fadc812ebc07" data-file-name="app/dashboard/user-management/page.tsx">
                <Edit className="mr-2 h-5 w-5 text-primary" /><span className="editable-text" data-unique-id="01315a9f-f409-4d89-8068-5b0783ea672f" data-file-name="app/dashboard/user-management/page.tsx">
                Edit Pengguna
              </span></h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700" data-unique-id="00b21cca-1277-4831-8a96-88f81b3f3e27" data-file-name="app/dashboard/user-management/page.tsx">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEditUser} data-unique-id="2c7e8c48-b6cc-4b9e-af51-1723cb3862cf" data-file-name="app/dashboard/user-management/page.tsx">
              <div className="space-y-4" data-unique-id="9b4a81f8-e840-4f34-b7e3-764fd8403364" data-file-name="app/dashboard/user-management/page.tsx">
                <div data-unique-id="7086212b-7c42-4c20-81d8-3fa6c4f0a4a6" data-file-name="app/dashboard/user-management/page.tsx">
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="0ec1f107-0b05-4822-845f-8e732b949bfd" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="4227adf3-6af5-441f-8b6a-b93bb5195220" data-file-name="app/dashboard/user-management/page.tsx">
                    Nama Lengkap
                  </span></label>
                  <input id="edit-name" name="name" type="text" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="c6115708-e2c4-46f0-a75d-14165dd59a6e" data-file-name="app/dashboard/user-management/page.tsx" />
                </div>
                
                <div data-unique-id="2c5200c1-9098-42c3-9c04-046cce4cdb3e" data-file-name="app/dashboard/user-management/page.tsx">
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="6971178a-ef48-498d-b17b-daf7a6bcb1f2" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="fe2ddae1-de5a-4454-a3f8-81731e4a8be4" data-file-name="app/dashboard/user-management/page.tsx">
                    Email
                  </span></label>
                  <div className="relative" data-unique-id="48272746-c616-4c70-bbbb-96be7e58932c" data-file-name="app/dashboard/user-management/page.tsx">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input id="edit-email" name="email" type="email" disabled value={formData.email} className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500" data-unique-id="72ea752f-7270-4745-b508-2a832c25bcbf" data-file-name="app/dashboard/user-management/page.tsx" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1" data-unique-id="25831ad0-caa8-4e3f-97ed-f7d608950efc" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="58770e78-986c-4490-9dcd-730eb57dcf06" data-file-name="app/dashboard/user-management/page.tsx">Email tidak dapat diubah</span></p>
                </div>
                
                <div data-unique-id="6d51389f-dea9-416f-a9b4-1f6ea86da243" data-file-name="app/dashboard/user-management/page.tsx">
                  <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="a6294c35-b32b-46a3-8c0d-a615eb5f7663" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="1f71eff6-095e-4b10-b74b-bb9dea86b046" data-file-name="app/dashboard/user-management/page.tsx">
                    Hak Akses
                  </span></label>
                  <select id="edit-role" name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" required data-unique-id="e0fd2036-bf86-4dde-9ae7-32c760220ff2" data-file-name="app/dashboard/user-management/page.tsx">
                    <option value="admin" data-unique-id="52d707c7-d4be-4ff2-825d-b47ce5e84658" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="fd4ade21-f053-4caf-bc41-aa2c5f1b2b65" data-file-name="app/dashboard/user-management/page.tsx">Administrator</span></option>
                    <option value="teacher" data-unique-id="648259a0-0905-4422-aea9-2f22eaed3104" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="637746a2-b11a-4f29-b7e8-056e74081b04" data-file-name="app/dashboard/user-management/page.tsx">Guru</span></option>
                    <option value="student" data-unique-id="31ca963a-49c1-4913-992d-2354a3d720be" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="3b4316c7-951d-41d1-955e-f2bc2b49c360" data-file-name="app/dashboard/user-management/page.tsx">Siswa</span></option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end" data-unique-id="c64f2665-da48-4130-b51a-8f85917e40d6" data-file-name="app/dashboard/user-management/page.tsx">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-50" data-unique-id="1348f8eb-e08f-4aff-a9a2-703e4ce01be1" data-file-name="app/dashboard/user-management/page.tsx"><span className="editable-text" data-unique-id="f156521a-f32e-47f4-8a87-4c32edf29b77" data-file-name="app/dashboard/user-management/page.tsx">
                  Batal
                </span></button>
                
                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2" data-unique-id="effb3785-8ad6-4207-9f65-f576210a4f9a" data-file-name="app/dashboard/user-management/page.tsx" data-dynamic-text="true">
                  {formLoading ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <CheckCircle size={16} />}
                  {formLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>}
    </div>;
}