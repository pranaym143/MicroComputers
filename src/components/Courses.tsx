import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Laptop, 
  FileText, 
  Code2, 
  Database, 
  Globe, 
  Award, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Search,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface Course {
  icon: React.ReactNode;
  title: string;
  duration: string;
  tag: string;
  description: string;
  highlights: string[];
  category: 'Foundations' | 'Programming' | 'Web & UI/UX' | 'Backend & Enterprise';
}

export default function Courses() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const coursesList: Course[] = [
    {
      icon: <Laptop className="w-5 h-5 text-indigo-400" />,
      title: 'Computer Basics',
      duration: '4 Weeks',
      tag: 'Foundation',
      category: 'Foundations',
      description: 'This course is designed for beginners who want to get a solid foundation in using computers and digital technologies.',
      highlights: ['Operating Systems', 'Hardware Components', 'File Management', 'Internet Security']
    },
    {
      icon: <FileText className="w-5 h-5 text-cyan-400" />,
      title: 'MS Office',
      duration: '6 Weeks',
      tag: 'Office Essential',
      category: 'Foundations',
      description: 'Microsoft Office is one of the most widely used productivity suites. This course will teach you how to use Word, Excel, PowerPoint, and Access to create professional documents, reports, presentations, and databases.',
      highlights: ['MS Word Drafting', 'MS Excel Spreadsheets', 'PowerPoint Presentations', 'MS Access Database']
    },
    {
      icon: <Award className="w-5 h-5 text-pink-400" />,
      title: 'DCA - Diploma in Computer Applications',
      duration: '6 Months',
      tag: 'Diploma',
      category: 'Foundations',
      description: 'The Diploma in Computer Applications (DCA) is a comprehensive course designed to provide in-depth knowledge of computer applications, software, and IT skills.',
      highlights: ['Computer Fundamentals', 'Operating Systems', 'MS Office & Internet', 'Database Basics']
    },
    {
      icon: <Award className="w-5 h-5 text-amber-400" />,
      title: 'PGDCA - Post Graduate Diploma in Computer Applications',
      duration: '1 Year',
      tag: 'Post Graduate',
      category: 'Foundations',
      description: 'The Post Graduate Diploma in Computer Applications (PGDCA) is designed for graduates who want to pursue advanced skills in computer science, programming, and IT management. The course offers a deeper understanding of advanced computing technologies.',
      highlights: ['Software Engineering', 'System Analysis & Design', 'Advanced Programming', 'Database Systems']
    },
    {
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      title: 'Tally ERP9/Prime with GST',
      duration: '8 Weeks',
      tag: 'Accounting',
      category: 'Foundations',
      description: 'This course is designed to provide you with the essential knowledge and skills required to manage accounting, finance, and taxation for businesses using Tally ERP9 and Tally Prime with GST integration.',
      highlights: ['Accounting Principles', 'Tally ERP9 & Prime', 'GST Calculation & Filings', 'Inventory Management']
    },
    {
      icon: <FileText className="w-5 h-5 text-emerald-500" />,
      title: 'Advanced Excel',
      duration: '4 Weeks',
      tag: 'Data Analysis',
      category: 'Foundations',
      description: 'Advanced Excel is a must-have skill for professionals in business analysis, data management, and financial analysis. This course teaches powerful Excel tools and features that make working with complex data sets easier and more efficient.',
      highlights: ['VLOOKUP & HLOOKUP', 'Pivot Tables & Charts', 'Macros & VBA Intro', 'Data Validation & Power Query']
    },
    {
      icon: <Code2 className="w-5 h-5 text-violet-400" />,
      title: 'Python',
      duration: '8 Weeks',
      tag: 'Most Popular',
      category: 'Programming',
      description: 'Learn the fundamentals of Python programming, including syntax, functions, and data structures.',
      highlights: ['Core Python Syntax', 'Data Structures', 'File I/O & Exceptions', 'Python Libraries']
    },
    {
      icon: <Code2 className="w-5 h-5 text-blue-400" />,
      title: 'C Language',
      duration: '6 Weeks',
      tag: 'System Language',
      category: 'Programming',
      description: 'Master the C programming language, focusing on memory management, functions, and data types.',
      highlights: ['Pointers & Memory', 'Data Types & Control Flow', 'Functions & Arrays', 'Structures & File Handling']
    },
    {
      icon: <Code2 className="w-5 h-5 text-indigo-500" />,
      title: 'C++',
      duration: '8 Weeks',
      tag: 'OOP',
      category: 'Programming',
      description: 'Learn object-oriented programming (OOP) concepts with C++ and create high-performance applications.',
      highlights: ['Classes & Objects', 'Inheritance & Polymorphism', 'Templates & STL', 'Memory Management']
    },
    {
      icon: <Database className="w-5 h-5 text-violet-500" />,
      title: 'Data Structure',
      duration: '8 Weeks',
      tag: 'Computer Science',
      category: 'Programming',
      description: 'Understand algorithms, linked lists, trees, stacks, queues, and graphs to manage data efficiently.',
      highlights: ['Arrays & Linked Lists', 'Stacks & Queues', 'Trees & Graphs', 'Sorting & Searching Algorithms']
    },
    {
      icon: <Code2 className="w-5 h-5 text-red-400" />,
      title: 'Core Java',
      duration: '8 Weeks',
      tag: 'Enterprise Standard',
      category: 'Programming',
      description: 'Get a deep dive into Java, including OOP principles, exception handling, and multithreading.',
      highlights: ['Java OOP Concepts', 'Exception Handling', 'Multithreading & Concurrency', 'Java Collections Framework']
    },
    {
      icon: <Code2 className="w-5 h-5 text-rose-500" />,
      title: 'Advanced Java',
      duration: '10 Weeks',
      tag: 'Advanced OOP',
      category: 'Programming',
      description: 'Master advanced topics such as JavaFX, JDBC, and network programming to build robust Java applications.',
      highlights: ['JavaFX UI Building', 'JDBC Database Connectivity', 'Servlet & JSP Basics', 'Network Programming']
    },
    {
      icon: <Globe className="w-5 h-5 text-cyan-400" />,
      title: 'Web Services',
      duration: '6 Weeks',
      tag: 'APIs',
      category: 'Backend & Enterprise',
      description: 'Learn how to build and consume web services with RESTful APIs and SOAP protocols in various technologies.',
      highlights: ['REST API Architecture', 'SOAP Protocol', 'JSON & XML Payloads', 'API Testing with Postman']
    },
    {
      icon: <FileText className="w-5 h-5 text-yellow-500" />,
      title: 'XML',
      duration: '4 Weeks',
      tag: 'Data Format',
      category: 'Backend & Enterprise',
      description: 'Understand XML syntax, schema, and how to work with XML in different programming languages.',
      highlights: ['XML Syntax & Schemas', 'DTD & XSD Validation', 'DOM & SAX Parsers', 'XSLT Transformations']
    },
    {
      icon: <Laptop className="w-5 h-5 text-purple-400" />,
      title: 'ASP.NET',
      duration: '10 Weeks',
      tag: 'Web Development',
      category: 'Backend & Enterprise',
      description: 'Learn to build dynamic web applications with ASP.NET using C# and the .NET framework.',
      highlights: ['ASP.NET Architecture', 'Web Forms & Server Controls', 'State Management', 'ADO.NET Database Access']
    },
    {
      icon: <Database className="w-5 h-5 text-red-500" />,
      title: 'SQL Server',
      duration: '8 Weeks',
      tag: 'RDBMS',
      category: 'Backend & Enterprise',
      description: 'Master SQL queries, stored procedures, database design, and optimization with Microsoft SQL Server.',
      highlights: ['Database Design', 'T-SQL Queries & Joins', 'Stored Procedures & Triggers', 'Query Optimization']
    },
    {
      icon: <Laptop className="w-5 h-5 text-indigo-400" />,
      title: 'ASP.NET MVC',
      duration: '10 Weeks',
      tag: 'Web Patterns',
      category: 'Backend & Enterprise',
      description: 'Build modern web applications using the MVC architecture in ASP.NET, focusing on controller, view, and model layers.',
      highlights: ['MVC Architecture Patterns', 'Controllers & Actions', 'Razor View Engine', 'Entity Framework Core']
    },
    {
      icon: <Code2 className="w-5 h-5 text-amber-500" />,
      title: 'Java Training',
      duration: '12 Weeks',
      tag: 'Professional Program',
      category: 'Programming',
      description: 'Learn Java programming in-depth, covering everything from basic syntax to advanced concepts like Java EE.',
      highlights: ['Java EE Core', 'Spring & Hibernate Intro', 'Software Architecture Patterns', 'Full-cycle Java Project']
    },
    {
      icon: <Globe className="w-5 h-5 text-orange-500" />,
      title: 'HTML5 & CSS3',
      duration: '4 Weeks',
      tag: 'Web Design',
      category: 'Web & UI/UX',
      description: 'Learn to create responsive, modern websites using HTML5 for structure and CSS3 for styling.',
      highlights: ['Semantic HTML5 Elements', 'CSS3 Flexbox & Grid', 'Responsive Media Queries', 'CSS Transitions & Animations']
    },
    {
      icon: <Globe className="w-5 h-5 text-yellow-400" />,
      title: 'HTML/JavaScript',
      duration: '6 Weeks',
      tag: 'Interactive Web',
      category: 'Web & UI/UX',
      description: 'Master HTML5 and JavaScript to create dynamic, interactive websites and web applications.',
      highlights: ['JavaScript Core Syntax', 'DOM Manipulation & Events', 'Fetch API & Async/Await', 'Interactive UI Components']
    },
    {
      icon: <Sparkles className="w-5 h-5 text-pink-400" />,
      title: 'UI/UX Design',
      duration: '6 Weeks',
      tag: 'Design Thinking',
      category: 'Web & UI/UX',
      description: 'Learn user-centered design principles and create intuitive, aesthetically pleasing user interfaces.',
      highlights: ['User Research & Wireframes', 'Figma Prototyping', 'Design Systems & UI Kits', 'Usability Testing']
    },
    {
      icon: <Code2 className="w-5 h-5 text-sky-400" />,
      title: 'UI Technologies',
      duration: '10 Weeks',
      tag: 'Frontend Framework',
      category: 'Web & UI/UX',
      description: 'Understand modern UI development tools like React, Angular, and Vue.js to build powerful web applications.',
      highlights: ['React Components & Hooks', 'Angular Core & Directives', 'Vue.js Reactive Bindings', 'State Management Solutions']
    },
    {
      icon: <Globe className="w-5 h-5 text-violet-400" />,
      title: 'Full Stack Web Development',
      duration: '16 Weeks',
      tag: 'Job Ready',
      category: 'Web & UI/UX',
      description: 'Learn to build both the front-end and back-end of web applications with a combination of technologies such as HTML, CSS, JavaScript, Node.js, and databases.',
      highlights: ['MERN Stack (MongoDB, Express, React, Node)', 'RESTful API Server', 'User Authentication', 'Deployment & Cloud Hosting']
    }
  ];

  const categories = ['All', 'Foundations', 'Programming', 'Web & UI/UX', 'Backend & Enterprise'];

  // Filtered and searched courses list
  const filteredCourses = useMemo(() => {
    return coursesList.filter((course) => {
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            course.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section className="py-24 relative overflow-hidden scroll-mt-24" id="courses">
      {/* Background Decorative glow */}
      <div className="absolute top-[30%] left-[5%] bg-glow-purple" />
      <div className="absolute bottom-[20%] right-[5%] bg-glow-blue" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="courses-header">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase font-mono tracking-[0.2em] text-violet-400 font-semibold mb-4"
          >
            OUR PROGRAMS
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight"
          >
            Curated Courses to <br />
            Launch your <span className="text-gradient">Tech Career</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#e2e8f0]/80 text-sm sm:text-base leading-relaxed"
          >
            We offer 23 comprehensive courses designed for absolute beginners as well as working professionals looking to polish their IT skill sets.
          </motion.p>
        </div>

        {/* Search and Filters Panel */}
        <div className="mb-12 space-y-6 max-w-4xl mx-auto" id="courses-filter-panel">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search courses by name, details or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#0b081e]/60 border border-white/5 focus:border-violet-500/30 rounded-2xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all backdrop-blur-md"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                  selectedCategory === category
                    ? 'bg-violet-600/20 border-violet-500/30 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                    : 'bg-white/3 border-white/5 text-[#e2e8f0]/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <motion.div 
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" 
          id="courses-grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, idx) => (
              <motion.div
                layout
                key={course.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-8 rounded-3xl flex flex-col justify-between relative group border border-white/5 hover:border-violet-500/20 transition-all duration-300 bg-[#0b081e]/40"
                id={`course-card-${idx}`}
              >
                <div>
                  {/* Header info */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="p-3 rounded-2xl bg-white/3 border border-white/8 group-hover:border-violet-500/30 transition-all duration-300">
                      {course.icon}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-violet-400 bg-violet-500/5 border border-violet-500/10 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </div>
                  </div>

                  {/* Tag & Title */}
                  <span className="text-[10px] font-mono tracking-widest text-violet-400/80 uppercase font-bold">
                    {course.tag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-display font-semibold text-white mt-1 mb-4 group-hover:text-violet-300 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-[#e2e8f0]/80 text-xs sm:text-sm leading-relaxed mb-6 font-light min-h-[60px]">
                    {course.description}
                  </p>

                  {/* Syllabus Highlights */}
                  <div className="border-t border-white/5 pt-6 mt-6">
                    <p className="text-[11px] font-mono text-[#e2e8f0] uppercase tracking-wider mb-4 flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      Curriculum Highlights
                    </p>
                    <ul className="space-y-2.5">
                      {course.highlights.map((highlight, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2.5 text-xs text-[#e2e8f0]/80">
                          <CheckCircle2 className="w-4 h-4 text-violet-500/80 shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Decorative gradient button indicator */}
                <div className="mt-8 pt-4 flex items-center justify-between text-xs font-mono text-violet-400 font-semibold group-hover:text-white transition-colors">
                  <span>ENROLL NOW</span>
                  <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-violet-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20 bg-[#0b081e]/20 rounded-3xl border border-white/5 backdrop-blur-md">
            <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Courses Found</h3>
            <p className="text-xs text-gray-400">We couldn't find any courses matching your search criteria. Try a different query.</p>
          </div>
        )}
      </div>
    </section>
  );
}
