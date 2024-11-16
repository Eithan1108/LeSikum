// File: sumit/lib/mockData.ts

// User data
export const currentUser = {
    name: "Jane Doe",
    username: "janedoe",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Passionate about summarizing complex topics and sharing knowledge.",
    followers: 1234,
    following: 567,
    summariesCount: 42,
    totalLikes: 14223,
    totalViews: 500981,
    rate: 4.8,
    status: "new"
  };
  
  // Summaries data
  export const summaries = [
    {
      id: '1',
      title: "Introduction to Quantum Mechanics",
      description: "This summary provides a comprehensive overview of quantum mechanics, covering basic concepts, popular algorithms, and real-world applications. It's perfect for beginners looking to understand the fundamentals of QM.",
      content: "Quantum Mechanics is a fundamental theory in physics that describes nature at the smallest scales of energy levels of atoms and subatomic particles. This summary covers key concepts such as wave-particle duality, the Schrödinger equation, and the uncertainty principle, as well as practical applications in various fields.",
      views: 1200,
      likes: 85,
      comments: [
        { id: '101', author: "Physics Student", content: "Great introduction! Very clear and easy to understand.", timestamp: "2023-06-15 10:30" },
        { id: '102', author: "Quantum Enthusiast", content: "Could you elaborate more on the uncertainty principle?", timestamp: "2023-06-16 14:15" }
      ],
      dateCreated: "2023-06-14",
      lastUpdated: "2023-06-16",
      author: "Dr. Jane Smith",
      tags: ["Physics", "Quantum Mechanics", "Science"],
      neuronGraph: {
        "quantum mechanics": {
          term: "Quantum Mechanics",
          definition: "A fundamental theory in physics that describes nature at the smallest scales of energy levels of atoms and subatomic particles.",
          relatedTerms: ["wave-particle duality", "Schrödinger equation", "uncertainty principle"]
        },
        "wave-particle duality": {
          term: "Wave-Particle Duality",
          definition: "The concept that every particle or quantum entity may be described as either a particle or a wave, depending on the circumstances of the experiment.",
          relatedTerms: ["quantum mechanics", "double-slit experiment"]
        },
        "schrödinger equation": {
          term: "Schrödinger Equation",
          definition: "A linear partial differential equation that describes the wave function of a quantum-mechanical system.",
          relatedTerms: ["quantum mechanics", "wave function"]
        }
      }
    },
    {
        id: "2",
        title: "Introduction to Machine Learning",
        description: "This summary gives an overview of the foundational concepts in machine learning, covering algorithms, model training, and real-world use cases.",
        content: "Machine Learning is a subset of artificial intelligence that enables systems to learn from data and improve performance without being explicitly programmed. This summary covers essential topics like supervised and unsupervised learning, neural networks, and popular algorithms such as decision trees and k-nearest neighbors.",
        views: 1500,
        likes: 20,
        comments: [
          { id: "201", author: "AI Researcher", content: "Very insightful, especially for beginners!", timestamp: "2023-07-20 11:00" },
          { id: "202", author: "Data Scientist", content: "Could you add more on deep learning techniques?", timestamp: "2023-07-22 09:45" }
        ],
        dateCreated: "2023-07-19",
        lastUpdated: "2023-07-22",
        author: "Dr. Alan Walker",
        tags: ["Machine Learning", "AI", "Data Science"],
        neuronGraph: {
          "machine learning": {
            term: "Machine Learning",
            definition: "A subset of AI that enables computers to learn from data without explicit programming.",
            relatedTerms: ["supervised learning", "unsupervised learning", "neural networks"]
          },
          "supervised learning": {
            term: "Supervised Learning",
            definition: "A type of machine learning where the model is trained on labeled data.",
            relatedTerms: ["classification", "regression", "neural networks"]
          },
          "neural networks": {
            term: "Neural Networks",
            definition: "A set of algorithms, modeled after the human brain, designed to recognize patterns and make predictions.",
            relatedTerms: ["machine learning", "deep learning", "artificial neurons"]
          }
        }
      },
      {
        id: "3",
        title: "Exploring the Theory of Relativity",
        description: "A detailed summary of Einstein's Theory of Relativity, covering both Special and General Relativity and their implications in modern physics.",
        content: "Einstein's Theory of Relativity revolutionized our understanding of space, time, and gravity. This summary explains Special Relativity, including the concepts of time dilation and length contraction, and General Relativity, which describes how gravity affects the fabric of space-time.",
        views: 980,
        likes: 75,
        comments: [
          { id: "301", author: "Astrophysics Enthusiast", content: "Very well explained! Would love to see more on black holes.", timestamp: "2023-05-12 16:10" },
          { id: "302", author: "Physics Professor", content: "Clear breakdown of complex concepts.", timestamp: "2023-05-13 09:25" }
        ],
        dateCreated: "2023-05-10",
        lastUpdated: "2023-05-14",
        author: "Prof. Michael Lee",
        tags: ["Physics", "Relativity", "Science"],
        neuronGraph: {
          "special relativity": {
            term: "Special Relativity",
            definition: "A theory in physics that addresses the relationship between space and time, introducing the concept that time can dilate and lengths contract depending on the relative speed of observers.",
            relatedTerms: ["time dilation", "length contraction"]
          },
          "general relativity": {
            term: "General Relativity",
            definition: "Einstein's theory describing gravity as a curvature of space-time, rather than as a force between masses.",
            relatedTerms: ["gravitational waves", "space-time"]
          }
        }
      },
      {
        id: "4",
        title: "Introduction to Blockchain Technology",
        description: "A concise overview of blockchain technology, discussing its foundational principles, decentralized structure, and real-world applications such as cryptocurrencies and smart contracts.",
        content: "Blockchain is a decentralized ledger technology that enables secure and transparent transactions without a central authority. This summary explores key concepts like cryptographic hashing, distributed consensus, and blockchain's applications in areas like finance, supply chains, and voting systems.",
        views: 1350,
        likes: 95,
        comments: [
          { id: "401", author: "Blockchain Developer", content: "A good introduction to blockchain fundamentals.", timestamp: "2023-04-21 14:50" },
          { id: "402", author: "Crypto Enthusiast", content: "Would love more detail on smart contracts.", timestamp: "2023-04-23 10:15" }
        ],
        dateCreated: "2023-04-20",
        lastUpdated: "2023-04-23",
        author: "Dr. Emily Carter",
        tags: ["Blockchain", "Cryptocurrency", "Technology"],
        neuronGraph: {
          "blockchain": {
            term: "Blockchain",
            definition: "A decentralized, distributed ledger technology that records transactions across many computers to ensure security and transparency.",
            relatedTerms: ["cryptographic hashing", "distributed ledger", "decentralization"]
          },
          "cryptographic hashing": {
            term: "Cryptographic Hashing",
            definition: "A method used to transform data into a fixed-size string of characters, which is nearly impossible to reverse.",
            relatedTerms: ["blockchain", "cryptography"]
          },
          "smart contracts": {
            term: "Smart Contracts",
            definition: "Self-executing contracts with the terms of the agreement directly written into lines of code.",
            relatedTerms: ["blockchain", "Ethereum", "decentralized applications"]
          }
        }
      },
      {
        id: "5",
        title: "Introduction to Genetic Algorithms",
        description: "An introductory guide to genetic algorithms, covering their biological inspiration, evolutionary principles, and use in optimization problems.",
        content: "Genetic algorithms are search heuristics inspired by the process of natural selection. This summary explains how these algorithms use selection, crossover, and mutation to evolve solutions to complex optimization problems.",
        views: 820,
        likes: 60,
        comments: [
          { id: "501", author: "Bioinformatics Student", content: "Interesting application of biological principles in computing!", timestamp: "2023-08-11 13:00" },
          { id: "502", author: "AI Researcher", content: "Could you discuss real-world applications?", timestamp: "2023-08-12 09:30" }
        ],
        dateCreated: "2023-08-10",
        lastUpdated: "2023-08-12",
        author: "Dr. Sarah Williams",
        tags: ["Genetic Algorithms", "Optimization", "AI"],
        neuronGraph: {
          "genetic algorithms": {
            term: "Genetic Algorithms",
            definition: "Optimization algorithms that mimic the process of natural selection to find optimal or near-optimal solutions to complex problems.",
            relatedTerms: ["mutation", "crossover", "selection"]
          },
          "mutation": {
            term: "Mutation",
            definition: "A process in genetic algorithms where random changes are introduced to candidate solutions to maintain diversity within the population.",
            relatedTerms: ["genetic algorithms", "evolutionary computation"]
          },
          "crossover": {
            term: "Crossover",
            definition: "A genetic algorithm process where two parent solutions combine to produce offspring solutions.",
            relatedTerms: ["genetic algorithms", "selection"]
          }
        }
      }
      
      
      
      
    // Add more summaries here...
  ];
  
  // Repositories data
  export const repositories = [
    {
      id: '1',
      name: 'Quantum Physics Notes',
      description: 'A comprehensive collection of quantum physics summaries and notes',
      owner: 'Dr. Jane Smith',
      stars: 128,
      tags: ['Physics', 'Quantum Mechanics', 'Science'],
      rootFolder: {
        id: 'root',
        name: 'Root',
        items: [
          {
            id: 'f1',
            name: 'Fundamentals',
            items: [
              { id: 's1', title: 'Introduction to Quantum Mechanics', description: 'Basic concepts of quantum mechanics', author: 'Dr. Jane Smith', lastUpdated: '2023-06-15', views: 1200, likes: 85, comments: 23, path: ['Fundamentals'] },
              { id: 's2', title: 'Wave-Particle Duality', description: 'Explanation of wave-particle duality', author: 'John Doe', lastUpdated: '2023-06-10', views: 950, likes: 72, comments: 15, path: ['Fundamentals'] },
            ]
          },
          {
            id: 'f2',
            name: 'Advanced Topics',
            items: [
              { id: 's3', title: 'Schrödinger Equation', description: 'Detailed analysis of the Schrödinger equation', author: 'Alice Johnson', lastUpdated: '2023-06-05', views: 800, likes: 63, comments: 10, path: ['Advanced Topics'] },
              {
                id: 'f3',
                name: 'Quantum Field Theory',
                items: [
                  { id: 's4', title: 'Introduction to QFT', description: 'Basics of Quantum Field Theory', author: 'Dr. Jane Smith', lastUpdated: '2023-05-20', views: 600, likes: 45, comments: 8, path: ['Advanced Topics', 'Quantum Field Theory'] },
                ]
              }
            ]
          },
        ]
      }
    },
    {
        id: "2",
        name: "Machine Learning Resources",
        description: "A curated collection of machine learning notes, tutorials, and research papers.",
        owner: "Dr. Alan Walker",
        stars: 145,
        tags: ["Machine Learning", "AI", "Data Science"],
        rootFolder: {
          id: "root",
          name: "Root",
          items: [
            {
              id: "f1",
              name: "Basics",
              items: [
                { id: "s1", title: "Introduction to Machine Learning", description: "Overview of machine learning concepts", author: "Dr. Alan Walker", lastUpdated: "2023-07-10", views: 2000, likes: 150, comments: 35, path: ["Basics"] },
                { id: "s2", title: "Supervised vs Unsupervised Learning", description: "Comparison of supervised and unsupervised learning", author: "John Doe", lastUpdated: "2023-07-05", views: 1800, likes: 130, comments: 28, path: ["Basics"] }
              ]
            },
            {
              id: "f2",
              name: "Deep Learning",
              items: [
                { id: "s3", title: "Introduction to Neural Networks", description: "Explanation of basic neural network architectures", author: "Dr. Alan Walker", lastUpdated: "2023-06-15", views: 1600, likes: 110, comments: 22, path: ["Deep Learning"] },
                {
                  id: "f3",
                  name: "Advanced Neural Networks",
                  items: [
                    { id: "s4", title: "Convolutional Neural Networks", description: "Detailed guide on CNNs", author: "Alice Johnson", lastUpdated: "2023-06-05", views: 1200, likes: 90, comments: 15, path: ["Deep Learning", "Advanced Neural Networks"] },
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        id: "3",
        name: "Blockchain Technology",
        description: "Notes and articles on the fundamentals and advanced concepts of blockchain and cryptocurrencies.",
        owner: "Dr. Emily Carter",
        stars: 95,
        tags: ["Blockchain", "Cryptocurrency", "Technology"],
        rootFolder: {
          id: "root",
          name: "Root",
          items: [
            {
              id: "f1",
              name: "Fundamentals",
              items: [
                { id: "s1", title: "Introduction to Blockchain", description: "Overview of blockchain technology", author: "Dr. Emily Carter", lastUpdated: "2023-05-10", views: 1500, likes: 100, comments: 20, path: ["Fundamentals"] },
                { id: "s2", title: "Cryptographic Hashing", description: "Explanation of hashing techniques in blockchain", author: "John Doe", lastUpdated: "2023-05-05", views: 1300, likes: 80, comments: 18, path: ["Fundamentals"] }
              ]
            },
            {
              id: "f2",
              name: "Advanced Concepts",
              items: [
                { id: "s3", title: "Smart Contracts", description: "Introduction to self-executing contracts", author: "Alice Johnson", lastUpdated: "2023-04-25", views: 1000, likes: 70, comments: 15, path: ["Advanced Concepts"] },
                {
                  id: "f3",
                  name: "Decentralized Applications",
                  items: [
                    { id: "s4", title: "Building DApps", description: "Guide to building decentralized applications", author: "Dr. Emily Carter", lastUpdated: "2023-04-15", views: 850, likes: 60, comments: 10, path: ["Advanced Concepts", "Decentralized Applications"] }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        id: "4",
        name: "Genetics and Biotechnology",
        description: "A repository of notes, tutorials, and research on genetics, biotechnology, and bioinformatics.",
        owner: "Dr. Sarah Williams",
        stars: 78,
        tags: ["Genetics", "Biotechnology", "Bioinformatics"],
        rootFolder: {
          id: "root",
          name: "Root",
          items: [
            {
              id: "f1",
              name: "Genetics",
              items: [
                { id: "s1", title: "Introduction to Genetics", description: "Basic concepts of heredity and genetic variation", author: "Dr. Sarah Williams", lastUpdated: "2023-03-20", views: 1100, likes: 90, comments: 12, path: ["Genetics"] },
                { id: "s2", title: "Mendelian Genetics", description: "A guide to Mendel's laws of inheritance", author: "John Doe", lastUpdated: "2023-03-15", views: 1000, likes: 85, comments: 14, path: ["Genetics"] }
              ]
            },
            {
              id: "f2",
              name: "Biotechnology",
              items: [
                { id: "s3", title: "CRISPR Technology", description: "An overview of gene editing with CRISPR", author: "Alice Johnson", lastUpdated: "2023-03-05", views: 900, likes: 70, comments: 10, path: ["Biotechnology"] },
                {
                  id: "f3",
                  name: "Bioinformatics",
                  items: [
                    { id: "s4", title: "Introduction to Bioinformatics", description: "Basics of bioinformatics and computational biology", author: "Dr. Sarah Williams", lastUpdated: "2023-02-25", views: 800, likes: 65, comments: 9, path: ["Biotechnology", "Bioinformatics"] }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        id: "5",
        name: "Introduction to Astrophysics",
        description: "A collection of astrophysics summaries, covering key concepts and recent discoveries.",
        owner: "Prof. Michael Lee",
        stars: 100,
        tags: ["Astrophysics", "Physics", "Space"],
        rootFolder: {
          id: "root",
          name: "Root",
          items: [
            {
              id: "f1",
              name: "Stellar Physics",
              items: [
                { id: "s1", title: "Life Cycle of Stars", description: "Overview of the stages of stellar evolution", author: "Prof. Michael Lee", lastUpdated: "2023-01-20", views: 1500, likes: 130, comments: 25, path: ["Stellar Physics"] },
                { id: "s2", title: "Supernovae", description: "An in-depth look at supernova explosions", author: "John Doe", lastUpdated: "2023-01-15", views: 1400, likes: 120, comments: 22, path: ["Stellar Physics"] }
              ]
            },
            {
              id: "f2",
              name: "Cosmology",
              items: [
                { id: "s3", title: "The Big Bang Theory", description: "Explanation of the origin of the universe", author: "Alice Johnson", lastUpdated: "2023-01-10", views: 1300, likes: 110, comments: 18, path: ["Cosmology"] },
                {
                  id: "f3",
                  name: "Black Holes",
                  items: [
                    { id: "s4", title: "Understanding Black Holes", description: "Exploring the physics of black holes", author: "Prof. Michael Lee", lastUpdated: "2023-01-05", views: 1200, likes: 100, comments: 15, path: ["Cosmology", "Black Holes"] }
                  ]
                }
              ]
            }
          ]
        }
      }
      
    // Add more repositories here...
  ];
  
  // Communities data
  export const communities = [
    { id: 1, name: "AI Enthusiasts", members: 5600, description: "Discuss the latest in AI and machine learning" },
    { id: 2, name: "Web Dev Wizards", members: 4200, description: "For passionate web developers" },
    { id: 3, name: "Data Science Hub", members: 3800, role: "Member" },
    { id: 4, name: "Blockchain Innovators", members: 2900, role: "Moderator" },
  ];
  
  // Testimonials data
  export const testimonials = [
    { id: 1, name: "Alex Johnson", role: "Student", avatar: "/placeholder.svg?height=50&width=50", content: "SummaryShare has revolutionized the way I study. The concise summaries help me grasp complex topics quickly!" },
    { id: 2, name: "Dr. Emily Chen", role: "Professor", avatar: "/placeholder.svg?height=50&width=50", content: "As an educator, I find SummaryShare to be an invaluable tool for both my students and my own research. It's a game-changer in knowledge sharing." },
    { id: 3, name: "Mark Williams", role: "Professional", avatar: "/placeholder.svg?height=50&width=50", content: "SummaryShare keeps me updated on industry trends without spending hours reading long articles. It's perfect for busy professionals." },
  ];