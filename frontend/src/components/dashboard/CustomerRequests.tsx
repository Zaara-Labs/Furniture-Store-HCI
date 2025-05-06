"use client";

import React from 'react';
import Link from 'next/link';

type RequestType = 'new-design' | 'feedback' | 'question';

type CustomerRequestProps = {
  id: string;
  customer: {
    name: string;
    avatar?: string;
  };
  requestType: RequestType;
  message: string;
  time: string;
  isRead: boolean;
};

const customerRequests: CustomerRequestProps[] = [
  {
    id: 'req-1',
    customer: {
      name: 'Emma Thompson',
      avatar: '/images/avatars/emma.jpg'
    },
    requestType: 'new-design',
    message: 'I need help designing my living room with minimalist furniture. Can you help?',
    time: '3 hours ago',
    isRead: false
  },
  {
    id: 'req-2',
    customer: {
      name: 'Michael Brown',
      avatar: '/images/avatars/michael.jpg'
    },
    requestType: 'feedback',
    message: 'The coffee table design looks amazing, but can we make it slightly taller?',
    time: '1 day ago',
    isRead: true
  },
  {
    id: 'req-3',
    customer: {
      name: 'Sophia Garcia',
      avatar: '/images/avatars/sophia.jpg'
    },
    requestType: 'question',
    message: 'Do you have any sustainable wood options for the bookshelf design?',
    time: '2 days ago',
    isRead: false
  },
  {
    id: 'req-4',
    customer: {
      name: 'Daniel Lee',
      avatar: '/images/avatars/daniel.jpg'
    },
    requestType: 'new-design',
    message: 'Looking for a home office setup that maximizes space in a small apartment.',
    time: '3 days ago',
    isRead: true
  }
];

export default function CustomerRequests() {
  const RequestTypeBadge = ({ type }: { type: RequestType }) => {
    const badgeStyles = {
      'new-design': 'bg-purple-100 text-purple-800',
      'feedback': 'bg-blue-100 text-blue-800',
      'question': 'bg-green-100 text-green-800'
    };

    const badgeLabels = {
      'new-design': 'New Design',
      'feedback': 'Feedback',
      'question': 'Question'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badgeStyles[type]}`}>
        {badgeLabels[type]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Customer Requests</h2>
      </div>
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {customerRequests.map((request) => (
            <li key={request.id}>
              <Link href={`/dashboard/requests/${request.id}`} className={`block ${!request.isRead ? 'bg-amber-50' : ''} hover:bg-gray-50`}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          {request.customer.name.charAt(0)}
                        </div>
                      </div>
                      <p className="ml-3 font-medium text-gray-900">{request.customer.name}</p>
                    </div>
                    <RequestTypeBadge type={request.requestType} />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{request.message}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs text-gray-500">{request.time}</p>
                    {!request.isRead && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <Link href="/dashboard/requests" className="text-sm font-medium text-amber-800 hover:text-amber-700">
          View all requests →
        </Link>
      </div>
    </div>
  );
}