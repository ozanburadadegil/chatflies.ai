import React from 'react';
import { AnalysisReport } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Gavel, 
  Users, 
  Calendar, 
  Hash, 
  ArrowLeft,
  Activity,
  BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportViewProps {
  report: AnalysisReport;
  onBack: () => void;
}

const COLORS = ['#9333ea', '#e9d5ff', '#ef4444', '#f59e0b'];

const ReportView: React.FC<ReportViewProps> = ({ report, onBack }) => {
  const statsData = [
    { name: 'Actions', value: report.action_items.length },
    { name: 'Decisions', value: report.decisions.length },
    { name: 'Risks', value: report.risks.length },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Chat
        </button>
        <div className="text-right">
            <span className="text-xs font-mono text-gray-400">ID: {report.workspace_id}</span>
            <div className="flex items-center justify-end text-xs text-green-600 font-semibold mt-1">
                <Activity className="w-3 h-3 mr-1" />
                Confidence: {(report.confidence * 100).toFixed(0)}%
            </div>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        
        {/* Top Meta Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Analysis Report</h1>
            <p className="text-gray-500 mb-6">Generated from command: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{report.request.command_text}</span></p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                    <span>{report.request.time_range.start_iso.split('T')[0]}</span>
                </div>
                 <div className="flex items-center text-gray-600">
                    <Hash className="w-4 h-4 mr-2 text-purple-500" />
                    <span>{report.channels_or_threads.length > 0 ? report.channels_or_threads.join(', ') : 'All Channels'}</span>
                </div>
                 <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    <span>{report.participants.length > 0 ? report.participants.join(', ') : 'All Participants'}</span>
                </div>
                 <div className="flex items-center text-gray-600">
                    <BarChart3 className="w-4 h-4 mr-2 text-purple-500" />
                    <span>{report.request.source.toUpperCase()}</span>
                </div>
            </div>
        </div>

        {/* Executive Summary & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Executive Summary</h3>
                <ul className="space-y-3">
                    {report.summary_bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start text-gray-700 leading-relaxed">
                            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></span>
                            {bullet}
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
                 <h3 className="text-sm font-bold text-gray-500 mb-2 w-full text-left">Insights Distribution</h3>
                 <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex justify-between w-full text-xs text-gray-500 mt-2">
                    <span className="flex items-center"><span className="w-2 h-2 bg-purple-600 rounded-full mr-1"></span> Actions</span>
                    <span className="flex items-center"><span className="w-2 h-2 bg-purple-200 rounded-full mr-1"></span> Decisions</span>
                    <span className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span> Risks</span>
                 </div>
            </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center">
                <CheckCircle2 className="w-5 h-5 text-purple-700 mr-2" />
                <h3 className="text-lg font-bold text-purple-900">Action Items</h3>
            </div>
            {report.action_items.length === 0 ? (
                <div className="p-8 text-center text-gray-400 italic">No action items detected.</div>
            ) : (
                <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3 text-left">Task</th>
                            <th className="px-6 py-3 text-left">Owner</th>
                            <th className="px-6 py-3 text-left">Priority</th>
                            <th className="px-6 py-3 text-left">Due</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {report.action_items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800 text-sm">{item.text}</td>
                                <td className="px-6 py-4">
                                    {item.owner ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {item.owner}
                                        </span>
                                    ) : <span className="text-gray-400 text-xs">-</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase
                                        ${item.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-green-100 text-green-800'}`}>
                                        {item.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs">
                                    {item.due_date_iso ? item.due_date_iso.split('T')[0] : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

        {/* Decisions and Risks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Decisions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center">
                    <Gavel className="w-5 h-5 text-blue-700 mr-2" />
                    <h3 className="text-lg font-bold text-blue-900">Decisions Made</h3>
                </div>
                <div className="p-6">
                    {report.decisions.length === 0 ? (
                        <p className="text-gray-400 italic text-sm">No decisions explicitly recorded.</p>
                    ) : (
                        <ul className="space-y-4">
                            {report.decisions.map((d, idx) => (
                                <li key={idx} className="flex">
                                    <span className="mt-1 mr-3 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{idx+1}</span>
                                    <span className="text-gray-700 text-sm">{d}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Risks */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-700 mr-2" />
                    <h3 className="text-lg font-bold text-red-900">Identified Risks</h3>
                </div>
                <div className="p-6">
                    {report.risks.length === 0 ? (
                        <p className="text-gray-400 italic text-sm">No significant risks identified.</p>
                    ) : (
                        <ul className="space-y-4">
                            {report.risks.map((r, idx) => (
                                <li key={idx} className="flex bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-800 text-sm font-medium">{r}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ReportView;