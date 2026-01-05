import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, BarChart3, Edit, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import Logo from '../components/Logo';
import { classApi } from '../services/classApi';
import { api } from '../services/api';
const ClassDetails = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { t, language } = useLanguage();
  const [classData, setClassData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);
  const loadData = async () => {
    if (!classId) return;
    setIsLoading(true);
    setError(null);
    try {
      const userResult = await api.getCurrentUser();
      if (userResult.success && userResult.data) {
        setUser(userResult.data.user);
      }
      const classResult = await classApi.getClassById(classId);
      if (classResult.success && classResult.data) {
        setClassData(classResult.data.class);
      } else {
        setError(classResult.message || t('classNotFound'));
      }
    } catch (error: any) {
      console.error('Load data error:', error);
      setError(error.message || 'Failed to load class data');
    } finally {
      setIsLoading(false);
    }
  };
  const handleBack = () => {
    navigate('/teacher/home');
  };
  const handleClassAnalysis = () => {
    navigate(`/teacher/classes/${classId}/analysis`);
  };
  const handleEditClass = () => {
    navigate(`/teacher/classes/${classId}/edit`);
  };
  const handleStudentClick = (studentId: string) => {
    navigate(`/teacher/classes/${classId}/students/${studentId}`);
  };
  const filteredStudents = classData?.students?.filter((student: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return student.name?.toLowerCase().includes(query);
  }) || [];
  const renderSidebar = () => (
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
  );
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderSidebar()}
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }
  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderSidebar()}
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">{error || t('classNotFound')}</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              {t('back')}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {}
      {renderSidebar()}
      {}
      <div className="ml-64">
        {}
        <header className="bg-white border-b-2 border-gray-900">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language === 'ja' ? 'クラス ' : 'Lớp '}{classData.name}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClassAnalysis}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <BarChart3 size={20} />
                  <span>{t('classAnalysis')}</span>
                </button>
                <button
                  onClick={handleEditClass}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Edit size={20} />
                  <span>{t('editClass')}</span>
                </button>
                <LanguageSelector />
              </div>
            </div>
          </div>
        </header>
        {}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t('searchStudent')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {filteredStudents.length}/{classData.students?.length || 0} {language === 'ja' ? '学生' : 'Sinh viên'} {language === 'ja' ? '表示中' : 'đang hiển thị'}
            </p>
          </div>
        </div>
        {}
        <main className="container mx-auto px-4 py-8">
          {classData.students?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">
                {language === 'ja' ? 'このクラスには学生がいません' : 'Lớp này chưa có học sinh'}
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">
                {language === 'ja' ? '検索結果が見つかりませんでした' : 'Không tìm thấy kết quả tìm kiếm'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {language === 'ja' 
                  ? `"${searchQuery}" に一致する学生が見つかりませんでした`
                  : `Không có học sinh nào khớp với "${searchQuery}"`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student: any) => {
                const getGenderLabel = (gender: string | null | undefined) => {
                  if (!gender) return '-';
                  if (language === 'ja') {
                    return gender === 'male' ? '男性' : gender === 'female' ? '女性' : 'その他';
                  }
                  return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác';
                };
                const getClassificationLabel = (classification: any) => {
                  if (!classification || !classification.name) return '-';
                  return classification.name[language] || classification.name.vi || '-';
                };
                return (
                  <div
                    key={student._id}
                    onClick={() => handleStudentClick(student._id)}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border-2 border-gray-200 hover:border-gray-900 p-6"
                  >
                    {}
                    <div className="flex items-center gap-4 mb-4">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={student.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-900"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-900">
                          <User size={32} className="text-gray-400" />
                        </div>
                      )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                    </div>
                    </div>
                    {}
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          {language === 'ja' ? '学生ID' : 'Mã sinh viên'}:{' '}
                        </span>
                        <span className="text-gray-600">{student.studentId || '-'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">{t('email')}: </span>
                        <span className="text-gray-600">{student.email}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          {language === 'ja' ? '性別' : 'Giới tính'}:{' '}
                        </span>
                        <span className="text-gray-600">{getGenderLabel(student.gender)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          {language === 'ja' ? '性格タイプ' : 'Loại tính cách'}:{' '}
                        </span>
                        <span className="text-gray-600">
                          {getClassificationLabel(student.classification)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default ClassDetails;
