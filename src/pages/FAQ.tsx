import React, { useState } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCourse } from '../context/CourseContext';

type FAQItem = {
  id: number;
  question: string;
  answer: string;
  category: string;
};

type Category = { name: string; icon: string; value: string };

type ExpandedMap = Record<number, boolean>;

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Questions');
  const [expandedItems, setExpandedItems] = useState<ExpandedMap>({});
  const { selectedCourse } = useCourse();

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "How do I submit my assignments?",
      answer: "Assignments should be submitted through the course portal. Make sure to follow the submission guidelines and submit before the deadline. Late submissions may incur penalties as outlined in the syllabus.",
      category: "assignments"
    },
    {
      id: 2,
      question: "How is my final grade calculated?",
      answer: "Your final grade is calculated based on: Assignments (40%), Midterm Exam (25%), Final Exam (30%), and Class Participation (5%). All percentages are weighted accordingly.",
      category: "grading"
    },
    {
      id: 3,
      question: "What programming languages are used in this course?",
      answer: "This course primarily uses Java for implementing data structures and algorithms. Some assignments may also involve pseudocode and algorithm analysis.",
      category: "technical"
    },
    {
      id: 4,
      question: "What is the attendance policy?",
      answer: "Regular attendance is expected and contributes to your participation grade. If you must miss a class, please notify the instructor in advance when possible.",
      category: "attendance"
    },
    {
      id: 5,
      question: "Can I work with other students on assignments?",
      answer: "Collaboration policies vary by assignment. Some assignments allow discussion of concepts but require individual implementation. Always check the specific assignment guidelines.",
      category: "assignments"
    },
    {
      id: 6,
      question: "How do I access the course materials and recordings?",
      answer: "Course materials and lecture recordings are available through the course portal. You'll need your VT credentials to access them. Materials are typically posted within 24 hours of each lecture.",
      category: "technical"
    },
    {
      id: 7,
      question: "What should I bring to exams?",
      answer: "Bring a valid photo ID, writing materials, and any approved calculators. Electronic devices are not permitted unless specifically stated. Check the exam guidelines for specific requirements.",
      category: "exams"
    },
    {
      id: 8,
      question: "How can I request a grade review or regrade?",
      answer: "Grade review requests must be submitted within one week of grade release. Submit a written explanation of your concerns to the instructor during office hours.",
      category: "grading"
    },
    {
      id: 9,
      question: "What development environment should I use?",
      answer: "We recommend using IntelliJ IDEA or Eclipse for Java development. Make sure you have Java JDK 11 or higher installed. Detailed setup instructions are provided in the first lecture.",
      category: "technical"
    },
    {
      id: 10,
      question: "How can I get additional help with course material?",
      answer: "You can attend office hours, join study groups, use the discussion forum, or schedule a meeting with the instructor. The AI Learning Assistant is also available 24/7 for quick questions.",
      category: "general"
    }
  ];

  const categories: Category[] = [
    { name: "All Questions", icon: "help-circle", value: "All Questions" },
    { name: "Assignments", icon: "book", value: "assignments" },
    { name: "Grading", icon: "message-circle", value: "grading" },
    { name: "Technical", icon: "clock", value: "technical" },
    { name: "Exams", icon: "help-circle", value: "exams" },
    { name: "Attendance", icon: "clock", value: "attendance" },
    { name: "General", icon: "message-circle", value: "general" }
  ];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Questions' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: number): void => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'help-circle':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <path d="M12 17h.01"></path>
          </svg>
        );
      case 'book':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
          </svg>
        );
      case 'message-circle':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="mt-2 opacity-90">
          {selectedCourse 
            ? `Find quick answers to common questions about ${selectedCourse.code} - ${selectedCourse.title}`
            : 'Find quick answers to common questions about the course'
          }
        </p>
        {selectedCourse && (
          <div className="mt-3 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm inline-block">
            Current Course: {selectedCourse.code}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category:</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.value
                    ? 'bg-vt-maroon text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryIcon(category.icon)}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredFAQs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg shadow-md">
            <button
              onClick={() => toggleExpanded(faq.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {faq.category}
                </span>
                <ChevronDownIcon 
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedItems[faq.id] ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </button>
            
            {expandedItems[faq.id] && (
              <div className="px-6 pb-4 border-t border-gray-100">
                <p className="text-gray-700 leading-relaxed pt-4">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-vt-maroon mb-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-4">
            If you can't find the answer you're looking for, don't hesitate to reach out for help.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button className="px-6 py-3 bg-vt-maroon text-white rounded-lg hover:bg-red-800 transition-colors duration-200">
              Contact Instructor
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              Visit Office Hours
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
