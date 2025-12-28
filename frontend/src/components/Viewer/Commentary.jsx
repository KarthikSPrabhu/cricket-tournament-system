import React, { useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { formatDate } from '../../utils/helpers';
import { Spinner } from '../Common/Loader';

const Commentary = ({ matchId }) => {
  const [commentary, setCommentary] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    if (!matchId || !socket) return;

    // Listen for commentary updates
    socket.on('commentary-update', (data) => {
      if (data.matchId === matchId) {
        setCommentary(prev => [data.commentary, ...prev.slice(0, 49)]);
      }
    });

    // Join match room for commentary
    socket.emit('join-match', matchId);

    // Fetch initial commentary
    const fetchCommentary = async () => {
      try {
        // In a real app, you would fetch from API
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch commentary:', error);
        setLoading(false);
      }
    };

    fetchCommentary();

    return () => {
      socket.off('commentary-update');
      socket.emit('leave-match', matchId);
    };
  }, [matchId, socket]);

  const getCommentaryTypeColor = (type) => {
    switch (type) {
      case 'wicket':
        return 'bg-red-900/30 border-red-700';
      case 'boundary':
        return 'bg-green-900/30 border-green-700';
      case 'six':
        return 'bg-yellow-900/30 border-yellow-700';
      case 'milestone':
        return 'bg-blue-900/30 border-blue-700';
      default:
        return 'bg-gray-900/30 border-gray-700';
    }
  };

  const getCommentaryTypeIcon = (type) => {
    switch (type) {
      case 'wicket':
        return '🎯';
      case 'boundary':
        return '🎉';
      case 'six':
        return '💥';
      case 'milestone':
        return '🏆';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 h-[500px] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <h3 className="text-lg font-bold text-white">Ball-by-Ball Commentary</h3>
        <p className="text-sm text-gray-400">Live updates from the match</p>
      </div>

      {/* Commentary List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {commentary.length > 0 ? (
          commentary.map((item, index) => (
            <div
              key={index}
              className={`border-l-4 p-3 rounded-r-lg ${getCommentaryTypeColor(item.type)}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">{getCommentaryTypeIcon(item.type)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-white">
                        Over {item.over}.{item.ball}: 
                      </span>
                      <span className="ml-2 text-gray-300">{item.text}</span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {formatDate(item.timestamp, 'HH:mm')}
                    </span>
                  </div>
                  {item.player && (
                    <div className="mt-2 text-sm text-gray-400">
                      ↳ {item.player.name} {item.runs > 0 && `scored ${item.runs} run${item.runs > 1 ? 's' : ''}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-400">No commentary available yet</p>
            <p className="text-sm text-gray-500 mt-2">Commentary will appear here once the match starts</p>
          </div>
        )}
      </div>

      {/* Match Status */}
      <div className="border-t border-gray-700 p-4 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Last Updated</p>
            <p className="text-white">{formatDate(new Date(), 'HH:mm:ss')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Commentary</p>
            <p className="text-white font-bold">{commentary.length} entries</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commentary;