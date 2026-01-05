import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToastMessage } from '../contexts/ToastContext';
import LanguageSelector from '../components/LanguageSelector';
import Logo from '../components/Logo';
import { classApi } from '../services/classApi';
import { api } from '../services/api';
const EditClass = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { t } = useLanguage();
  const toast = useToastMessage();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    teacherName: '',
    description: '',
  });
  const [studentEmails, setStudentEmails] = useState<string[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [deleteEmails, setDeleteEmails] = useState<string[]>([]);
  const [deleteStudentIds, setDeleteStudentIds] = useState<string[]>([]);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deleteStudentIdInput, setDeleteStudentIdInput] = useState('');
  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);
  const loadData = async () => {
    if (!classId) return;
    setIsLoadingData(true);
    try {
      const userResult = await api.getCurrentUser();
      if (userResult.success && userResult.data) {
        setUser(userResult.data.user);
      }
      const classResult = await classApi.getClassById(classId);
      if (classResult.success && classResult.data) {
        const classData = classResult.data.class;
        setFormData({
          name: classData.name || '',
          teacherName: classData.teacherName || '',
          description: classData.description || '',
        });
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setIsLoadingData(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('invalidEmail');
      return;
    }
    if (!studentEmails.includes(trimmedEmail)) {
      setStudentEmails([...studentEmails, trimmedEmail]);
      setEmailInput('');
    } else {
      toast.warning('emailAlreadyAdded');
    }
  };
  const handleRemoveEmail = (email: string) => {
    setStudentEmails(studentEmails.filter(e => e !== email));
  };
  const handleAddStudentId = () => {
    if (studentIdInput.trim() && !studentIds.includes(studentIdInput.trim())) {
      setStudentIds([...studentIds, studentIdInput.trim()]);
      setStudentIdInput('');
    }
  };
  const handleRemoveStudentId = (id: string) => {
    setStudentIds(studentIds.filter(i => i !== id));
  };
  const handleAddDeleteEmail = () => {
    const trimmedEmail = deleteEmailInput.trim();
    if (!trimmedEmail) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('invalidEmail');
      return;
    }
    if (!deleteEmails.includes(trimmedEmail)) {
      setDeleteEmails([...deleteEmails, trimmedEmail]);
      setDeleteEmailInput('');
    } else {
      toast.warning('emailAlreadyAdded');
    }
  };
  const handleRemoveDeleteEmail = (email: string) => {
    setDeleteEmails(deleteEmails.filter(e => e !== email));
  };
  const handleAddDeleteStudentId = () => {
    if (deleteStudentIdInput.trim() && !deleteStudentIds.includes(deleteStudentIdInput.trim())) {
      setDeleteStudentIds([...deleteStudentIds, deleteStudentIdInput.trim()]);
      setDeleteStudentIdInput('');
    }
  };
  const handleRemoveDeleteStudentId = (id: string) => {
    setDeleteStudentIds(deleteStudentIds.filter(i => i !== id));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) return;
    if (!formData.name.trim()) {
      toast.error('classNameRequired');
      return;
    }
    setIsLoading(true);
    try {
      const updateData: any = { ...formData };
      if (studentEmails.length > 0 || studentIds.length > 0) {
        updateData.studentEmails = studentEmails.length > 0 ? studentEmails : undefined;
        updateData.studentIds = studentIds.length > 0 ? studentIds : undefined;
      }
      const result = await classApi.updateClass(classId, updateData);
      if (result.success) {
        if (deleteEmails.length > 0 || deleteStudentIds.length > 0) {
          const removeResult = await classApi.removeStudentsFromClass(
            classId,
            deleteEmails.length > 0 ? deleteEmails : undefined,
            deleteStudentIds.length > 0 ? deleteStudentIds : undefined
          );
          if (removeResult.success) {
            const hasNotFoundStudents = (result.data?.notFoundEmails?.length > 0 || result.data?.notFoundIds?.length > 0);
            if (hasNotFoundStudents) {
              const notFoundList = [
                ...(result.data.notFoundEmails || []),
                ...(result.data.notFoundIds || [])
              ];
              let message = t('updateClassFailed');
              message += `\n${t('studentsNotFound')}: ${notFoundList.join(', ')}`;
              toast.error('updateClassFailed', message, 7000);
            } else {
              let message = t('updateClassSuccess');
              if (removeResult.data?.removedCount > 0) {
                message += `\n${t('removedStudentsCount')}: ${removeResult.data.removedCount}`;
              }
              if (removeResult.data?.notFoundEmails?.length > 0 || removeResult.data?.notFoundIds?.length > 0) {
                const notFoundList = [
                  ...(removeResult.data.notFoundEmails || []),
                  ...(removeResult.data.notFoundIds || [])
                ];
                message += `\n${t('studentsNotFound')} (${t('removedStudentsCount')}): ${notFoundList.join(', ')}`;
              }
              toast.success('updateClassSuccess', message, 7000);
            }
          } else {
            toast.error('studentRemovedFailed', removeResult.message);
          }
        } else {
          if (result.data?.notFoundEmails?.length > 0 || result.data?.notFoundIds?.length > 0) {
            const notFoundList = [
              ...(result.data.notFoundEmails || []),
              ...(result.data.notFoundIds || [])
            ];
            let message = t('updateClassFailed');
            message += `\n${t('studentsNotFound')}: ${notFoundList.join(', ')}`;
            toast.error('updateClassFailed', message, 7000);
          } else {
            toast.success('updateClassSuccess', t('updateClassSuccess'), 7000);
          }
        }
        setTimeout(() => {
          navigate(`/teacher/classes/${classId}`);
        }, 1500);
      } else {
        toast.error('updateClassFailed', result.message);
      }
    } catch (error) {
      console.error('Update class error:', error);
      toast.error('updateClassFailed');
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancel = () => {
    navigate(`/teacher/classes/${classId}`);
  };
  const handleBack = () => {
    navigate(`/teacher/classes/${classId}`);
  };
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-gray-900 flex flex-col z-10">
        {}
        <div className="px-6 py-6">
          <Logo size={40} showText={true} />
        </div>
        {}
        <div className="px-6 mb-4">
          <button
            onClick={handleBack}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-900" />
            <span className="text-sm font-medium text-gray-900">{t('back')}</span>
          </button>
        </div>
        {}
        <div className="flex-1" />
        {}
        {user && (
          <div 
            onClick={() => navigate('/teacher/profile')}
            className="cursor-pointer hover:bg-gray-100 p-3 mx-4 mb-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-900 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-900 flex-shrink-0">
                  <User size={24} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {}
      <div className="ml-64">
        {}
        <header className="bg-white border-b-2 border-gray-900">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{t('editClass')}</h1>
              <div className="flex items-center gap-3">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </header>
        {}
        <main className="container mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            {}
            <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('classInformationForm')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('className')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('enterClassName')}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('teacherName')}
                  </label>
                  <input
                    type="text"
                    name="teacherName"
                    value={formData.teacherName}
                    disabled={true}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('classDescription')}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={t('enterClassDescription')}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>
            </div>
            {}
            <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('addStudents')}</h2>
              {}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('addStudentByEmail')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={t('enterEmailAddress')}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddEmail}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    {t('addStudent')}
                  </button>
                </div>
                {studentEmails.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {studentEmails.map((email, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('addStudentByStudentId')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    placeholder={t('enterStudentId')}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStudentId();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddStudentId}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    {t('addStudent')}
                  </button>
                </div>
                {studentIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {studentIds.map((id, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {id}
                        <button
                          type="button"
                          onClick={() => handleRemoveStudentId(id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {}
            <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('removeStudents')}</h2>
              {}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('removeStudentByEmail')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={deleteEmailInput}
                    onChange={(e) => setDeleteEmailInput(e.target.value)}
                    placeholder={t('enterEmailAddress')}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeleteEmail();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDeleteEmail}
                    disabled={!deleteEmailInput.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('removeStudent')}
                  </button>
                </div>
                {deleteEmails.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {deleteEmails.map((email, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full text-sm"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveDeleteEmail(email)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('removeStudentByStudentId')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deleteStudentIdInput}
                    onChange={(e) => setDeleteStudentIdInput(e.target.value)}
                    placeholder={t('enterStudentId')}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeleteStudentId();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDeleteStudentId}
                    disabled={!deleteStudentIdInput.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('removeStudent')}
                  </button>
                </div>
                {deleteStudentIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {deleteStudentIds.map((id, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full text-sm"
                      >
                        {id}
                        <button
                          type="button"
                          onClick={() => handleRemoveDeleteStudentId(id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !formData.name}
                className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
export default EditClass;
