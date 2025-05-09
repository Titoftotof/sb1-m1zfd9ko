import React from 'react';
import { MessageSquare, Image, Send } from 'lucide-react';

const Communication: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
        <button className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
          <MessageSquare className="w-5 h-5 mr-2" />
          Nouveau message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Messages récents</h2>
              <div className="flex space-x-2">
                <button className="flex items-center text-gray-600 hover:text-gray-900">
                  <Image className="w-5 h-5 mr-1" />
                  Photos
                </button>
                <button className="flex items-center text-gray-600 hover:text-gray-900">
                  <Send className="w-5 h-5 mr-1" />
                  Messages
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Message placeholder */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Sophie Martin</h3>
                      <span className="text-sm text-gray-500">Il y a 2 heures</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Emma a passé une excellente journée ! Elle a particulièrement apprécié les activités de peinture.
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <img
                        src="https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                        alt="Activity photo"
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional message placeholder */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Julie Petit</h3>
                      <span className="text-sm text-gray-500">Hier</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Lucas a bien dormi pendant sa sieste aujourd'hui. Il commence à dire quelques mots !
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium py-2 px-4 rounded-md border border-purple-200 transition-colors">
                Voir tous les messages
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages rapides</h2>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded-md hover:bg-purple-50 text-sm text-gray-600">
                Bonne sieste aujourd'hui
              </button>
              <button className="w-full text-left p-2 rounded-md hover:bg-purple-50 text-sm text-gray-600">
                Repas bien mangé
              </button>
              <button className="w-full text-left p-2 rounded-md hover:bg-purple-50 text-sm text-gray-600">
                Belle journée de jeux
              </button>
              <button className="w-full text-left p-2 rounded-md hover:bg-purple-50 text-sm text-gray-600">
                Activités du jour
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Messages non lus</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">2</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Photos partagées aujourd'hui</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communication;