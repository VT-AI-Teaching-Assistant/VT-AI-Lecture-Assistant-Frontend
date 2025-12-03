// User Profile Data
export type UserProfile = {
    id: string;
    name: string;
    email: string;
    major: string;
    year: string;
    gpa: string;
    profilePicture: string;
    enrolledCourses: { code: string; name: string; credits: number }[];
    stats: {
        totalCredits: number;
        semesterCredits: number;
        coursesCompleted: number;
    };
};

export const userProfile: UserProfile = {
    id: "123456789",
    name: "Sarah Johnson",
    email: "sarahj@vt.edu",
    major: "Computer Science",
    year: "Junior",
    gpa: "3.85",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    enrolledCourses: [
        { code: "CS 3114", name: "Data Structures & Algorithms", credits: 3 },
        { code: "CS 3704", name: "Intermediate Software Design", credits: 3 },
        { code: "MATH 2534", name: "Discrete Mathematics", credits: 3 },
        { code: "ENGL 3764", name: "Technical Writing", credits: 3 }
    ],
    stats: {
        totalCredits: 89,
        semesterCredits: 12,
        coursesCompleted: 28
    }
};

// Announcements Data
export type Announcement = {
    id: number;
    title: string;
    content: string;
    author: string;
    date: string; // ISO string
    priority: 'high' | 'medium' | 'low';
    course: string;
};

export const announcements: Announcement[] = [
    {
        id: 1,
        title: "Midterm Exam Schedule Updated",
        content: "The midterm exam for CS 3114 has been moved to March 15th. Please make note of this change and prepare accordingly.",
        author: "Dr. Smith",
        date: "2024-03-01T08:00:00Z",
        priority: "high",
        course: "CS 3114"
    },
    {
        id: 2,
        title: "Office Hours Extension",
        content: "I will be extending office hours this week due to the upcoming assignment deadline. Available Monday-Wednesday 2-5 PM.",
        author: "Prof. Johnson",
        date: "2024-02-29T14:00:00Z",
        priority: "medium",
        course: "CS 3704"
    },
    {
        id: 3,
        title: "Guest Lecture Tomorrow",
        content: "Don't miss tomorrow's guest lecture on Machine Learning Applications in Industry by Dr. Chen from Google.",
        author: "Dr. Wilson",
        date: "2024-02-28T16:00:00Z",
        priority: "low",
        course: "CS 3114"
    }
];

// Discussion Data
export type Discussion = {
    id: number;
    title: string;
    content: string;
    author: string;
    authorAvatar: string;
    date: string; // ISO string
    votes: number;
    replies: number;
    tags: string[];
    course: string;
};

export const discussions: Discussion[] = [
    {
        id: 1,
        title: "Help with Assignment 3 - Dynamic Programming",
        content: "I'm struggling with the recursive approach for the knapsack problem. Has anyone figured out the optimal substructure?",
        author: "Alex Chen",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        date: "2024-03-02T10:30:00Z",
        votes: 7,
        replies: 12,
        tags: ["assignment", "algorithms", "help"],
        course: "CS 3114"
    },
    {
        id: 2,
        title: "Study Group for Midterm",
        content: "Looking to form a study group for the upcoming CS 3114 midterm. Planning to meet this weekend at the library.",
        author: "Maria Rodriguez",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        date: "2024-03-01T14:00:00Z",
        votes: 15,
        replies: 8,
        tags: ["study-group", "midterm"],
        course: "CS 3114"
    }
];

// Chat Messages Data
export type ChatMessageData = {
    id: number;
    content: string;
    sender: 'ai' | 'user';
    timestamp: string;
};

export const chatMessages: ChatMessageData[] = [
    {
        id: 1,
        content: "Hello! I'm your AI Lecture Assistant. How can I help you today?",
        sender: "ai",
        timestamp: "2024-03-02T10:00:00Z"
    },
    {
        id: 2,
        content: "Can you explain the difference between a stack and a queue?",
        sender: "user",
        timestamp: "2024-03-02T10:01:00Z"
    },
    {
        id: 3,
        content: "Great question! A **stack** and a **queue** are both linear data structures, but they differ in how elements are added and removed:\n\n**Stack (LIFO - Last In, First Out):**\n- Elements are added and removed from the same end (top)\n- Main operations: `push()` (add) and `pop()` (remove)\n- Think of it like a stack of plates - you add and remove from the top\n- Use cases: function call management, undo operations, expression evaluation\n\n**Queue (FIFO - First In, First Out):**\n- Elements are added at one end (rear) and removed from the other (front)\n- Main operations: `enqueue()` (add) and `dequeue()` (remove)\n- Think of it like a line at a store - first person in line is first to be served\n- Use cases: scheduling processes, breadth-first search, handling requests\n\nWould you like me to show you some code examples?",
        sender: "ai",
        timestamp: "2024-03-02T10:01:30Z"
    },
    {
        id: 4,
        content: "Yes, that would be helpful!",
        sender: "user",
        timestamp: "2024-03-02T10:02:00Z"
    },
    {
        id: 5,
        content: "Here are simple implementations:\n\n**Stack Example (Python):**\n```python\nclass Stack:\n    def __init__(self):\n        self.items = []\n    \n    def push(self, item):\n        self.items.append(item)\n    \n    def pop(self):\n        if not self.is_empty():\n            return self.items.pop()\n    \n    def is_empty(self):\n        return len(self.items) == 0\n```\n\n**Queue Example (Python):**\n```python\nfrom collections import deque\n\nclass Queue:\n    def __init__(self):\n        self.items = deque()\n    \n    def enqueue(self, item):\n        self.items.append(item)\n    \n    def dequeue(self):\n        if not self.is_empty():\n            return self.items.popleft()\n    \n    def is_empty(self):\n        return len(self.items) == 0\n```\n\nThe key difference is in the removal: stack uses `pop()` (removes last), queue uses `popleft()` (removes first).",
        sender: "ai",
        timestamp: "2024-03-02T10:02:45Z"
    }
];

// Lectures Data
export type LectureData = {
    id: number;
    title: string;
    date: string; // ISO string
    course: string;
    duration: string;
    notes: string;
};

export const lectures: LectureData[] = [
    {
        id: 1,
        title: "Introduction to Data Structures",
        date: "2024-01-14",
        course: "CS 3114",
        duration: "75 minutes",
        notes: `# Introduction to Data Structures
  
  ## Overview
  Data structures are fundamental building blocks in computer science that allow us to organize and store data efficiently.
  
  ## Key Concepts
  
  ### What are Data Structures?
  - Ways of organizing and storing data in a computer
  - Enable efficient access and modification of data
  - Different structures are optimal for different operations
  
  ### Types of Data Structures
  
  #### Linear Data Structures
  - **Arrays**: Fixed-size sequential collection
  - **Linked Lists**: Dynamic size with node-based structure
  - **Stacks**: LIFO (Last In, First Out) principle
  - **Queues**: FIFO (First In, First Out) principle
  
  #### Non-Linear Data Structures
  - **Trees**: Hierarchical structure with root and children
  - **Graphs**: Collection of vertices connected by edges
  - **Hash Tables**: Key-value pairs with hash functions
  
  ### Time and Space Complexity
  Understanding Big O notation is crucial for analyzing data structures:
  - **O(1)**: Constant time
  - **O(log n)**: Logarithmic time
  - **O(n)**: Linear time
  - **O(n²)**: Quadratic time
  
  ## Next Steps
  In the following lectures, we'll dive deep into each data structure, implementing them and analyzing their performance characteristics.`
    },
    {
        id: 2,
        title: "Stack and Queue Implementation",
        date: "2024-01-21",
        course: "CS 3114",
        duration: "90 minutes",
        notes: `# Arrays and Dynamic Arrays
  
  ## Static Arrays
  
  ### Characteristics
  - Fixed size determined at creation
  - Elements stored in contiguous memory locations
  - Constant time access using index: O(1)
  - Cache-friendly due to memory locality
  
  ### Operations and Complexity
  - **Access**: O(1)
  - **Search**: O(n)
  - **Insertion**: O(n) (due to shifting)
  - **Deletion**: O(n) (due to shifting)
  
  ## Dynamic Arrays
  
  ### Implementation Details
  Dynamic arrays (like ArrayList in Java, vector in C++, list in Python) automatically resize when needed.
  
  ### Resizing Strategy
  - Typically double the size when capacity is reached
  - Amortized O(1) insertion time
  - Trade-off between memory usage and performance
  
  ### Code Example (Java)
  \`\`\`java
  public class DynamicArray<T> {
      private T[] array;
      private int size;
      private int capacity;
      
      public DynamicArray() {
          capacity = 10;
          array = (T[]) new Object[capacity];
          size = 0;
      }
      
      public void add(T element) {
          if (size == capacity) {
              resize();
          }
          array[size++] = element;
      }
      
      private void resize() {
          capacity *= 2;
          T[] newArray = (T[]) new Object[capacity];
          System.arraycopy(array, 0, newArray, 0, size);
          array = newArray;
      }
  }
  \`\`\`
  
  ## Applications
  - Database indexing
  - Image processing (2D arrays)
  - Mathematical computations
  - Implementing other data structures`
    },
    {
        id: 3,
        title: "Binary Trees and Tree Traversals",
        date: "2024-01-28",
        course: "CS 3114",
        duration: "85 minutes",
        notes: `# Linked Lists
  
  ## Introduction
  Linked lists are dynamic data structures where elements (nodes) are stored in sequence, with each node containing data and a reference to the next node.
  
  ## Types of Linked Lists
  
  ### Singly Linked List
  - Each node points to the next node
  - Last node points to null
  - Can only traverse in one direction
  
  ### Doubly Linked List
  - Each node has pointers to both next and previous nodes
  - Allows bidirectional traversal
  - Requires more memory per node
  
  ### Circular Linked List
  - Last node points back to the first node
  - Forms a circle
  - Useful for round-robin scheduling
  
  ## Implementation (Singly Linked List)
  
  \`\`\`java
  class ListNode {
      int val;
      ListNode next;
      
      ListNode(int val) {
          this.val = val;
          this.next = null;
      }
  }
  
  class LinkedList {
      private ListNode head;
      
      public void insert(int val) {
          ListNode newNode = new ListNode(val);
          newNode.next = head;
          head = newNode;
      }
      
      public void delete(int val) {
          if (head == null) return;
          
          if (head.val == val) {
              head = head.next;
              return;
          }
          
          ListNode current = head;
          while (current.next != null && current.next.val != val) {
              current = current.next;
          }
          
          if (current.next != null) {
              current.next = current.next.next;
          }
      }
  }
  \`\`\`
  
  ## Advantages vs Disadvantages
  
  ### Advantages
  - Dynamic size
  - Efficient insertion/deletion at beginning: O(1)
  - Memory allocated as needed
  
  ### Disadvantages
  - No random access (must traverse from head)
  - Extra memory for storing pointers
  - Not cache-friendly due to non-contiguous memory
  
  ## Applications
  - Implementation of stacks and queues
  - Music playlist (next/previous song)
  - Browser history (back/forward)
  - Undo functionality in applications`
    }
];

// Grades Data
export type Grade = {
    id: number;
    assignment: string;
    course: string;
    type: 'Assignment' | 'Quiz' | 'Project' | 'Exam' | string;
    score: number;
    maxScore: number;
    dueDate: string; // ISO string
    submittedDate: string; // ISO string
    feedback: string;
};

export const grades: Grade[] = [
    {
        id: 1,
        assignment: "Assignment 1: Basic Data Structures",
        course: "CS 3114",
        type: "Assignment",
        score: 95,
        maxScore: 100,
        dueDate: "2024-02-10",
        submittedDate: "2024-02-09",
        feedback: "Excellent implementation of linked list operations. Good code documentation."
    },
    {
        id: 2,
        assignment: "Quiz 1: Arrays and Complexity",
        course: "CS 3114",
        type: "Quiz",
        score: 88,
        maxScore: 100,
        dueDate: "2024-02-18",
        submittedDate: "2024-02-18",
        feedback: "Good understanding of time complexity. Minor error in space complexity analysis."
    },
    {
        id: 3,
        assignment: "Project 1: Text Editor",
        course: "CS 3704",
        type: "Project",
        score: 92,
        maxScore: 100,
        dueDate: "2024-02-25",
        submittedDate: "2024-02-24",
        feedback: "Well-structured code with good use of design patterns. UI could be more polished."
    },
    {
        id: 4,
        assignment: "Midterm Exam",
        course: "CS 3114",
        type: "Exam",
        score: 87,
        maxScore: 100,
        dueDate: "2024-03-01",
        submittedDate: "2024-03-01",
        feedback: "Strong performance on algorithmic questions. Review tree traversal methods."
    },
    {
        id: 5,
        assignment: "Assignment 2: Stack Implementation",
        course: "CS 3114",
        type: "Assignment",
        score: 98,
        maxScore: 100,
        dueDate: "2024-03-05",
        submittedDate: "2024-03-04",
        feedback: "Perfect implementation with excellent error handling and edge case coverage."
    }
];

// FAQ Data
export type FAQ = {
    id: number;
    question: string;
    answer: string;
    category: string;
};

export const faqData: FAQ[] = [
    {
        id: 1,
        question: "How do I submit assignments?",
        answer: "Assignments can be submitted through the Canvas portal. Make sure to upload all required files and check the submission deadline. Late submissions may incur penalty points.",
        category: "Assignments"
    },
    {
        id: 2,
        question: "What is the attendance policy?",
        answer: "Regular attendance is expected. More than 3 unexcused absences may result in a reduction of your final grade. Please notify your instructor in advance if you need to miss class due to illness or emergency.",
        category: "Policies"
    },
    {
        id: 3,
        question: "How are grades calculated?",
        answer: "Final grades are calculated as follows: Assignments (40%), Quizzes (20%), Midterm Exam (20%), Final Exam (20%). Letter grades are assigned based on the standard scale (A: 90-100, B: 80-89, etc.).",
        category: "Grading"
    },
    {
        id: 4,
        question: "Can I use external libraries for projects?",
        answer: "Unless specifically stated otherwise, you should implement data structures and algorithms from scratch. Using external libraries defeats the learning purpose. Check with your instructor if you're unsure about a specific library.",
        category: "Projects"
    },
    {
        id: 5,
        question: "What programming language should I use?",
        answer: "The course primarily uses Java for examples and assignments. However, you may use Python or C++ for projects if you prefer, as long as you demonstrate the same level of understanding.",
        category: "Programming"
    },
    {
        id: 6,
        question: "How do I get help with coding problems?",
        answer: "You can: 1) Attend office hours, 2) Post questions in the discussion forum, 3) Form study groups with classmates, 4) Use the AI assistant for conceptual help. Remember, collaboration is encouraged but copying code is not permitted.",
        category: "Help"
    },
    {
        id: 7,
        question: "What should I do if I'm struggling with the material?",
        answer: "Don't wait until it's too late! Reach out early by attending office hours, joining study groups, or scheduling a meeting with your instructor. The tutoring center also offers additional support for computer science courses.",
        category: "Academic Support"
    },
    {
        id: 8,
        question: "Are there any extra credit opportunities?",
        answer: "Occasionally, extra credit opportunities may be offered, such as attending CS department seminars or completing bonus problems. These will be announced in class and are typically worth 1-2% of your final grade.",
        category: "Grading"
    }
];