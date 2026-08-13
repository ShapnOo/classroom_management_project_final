"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Calendar, Award, GraduationCap } from "lucide-react";

export default function AnimatedSide() {
  return (
    <div className="relative w-full h-full bg-primary-600 overflow-hidden flex items-center justify-center p-12 text-white">
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-white blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-primary-400 blur-3xl mix-blend-overlay"></div>
      </div>

      <div className="z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Empowering Education</h2>
          <p className="text-primary-100 text-lg leading-relaxed">
            Classroom Management brings administrators, teachers, and students together in one seamless platform for a better learning experience.
          </p>
        </motion.div>

        {/* Floating Icons Grid */}
        <div className="relative h-64 w-full">
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl"
          >
            <BookOpen className="w-8 h-8 text-primary-50" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -10, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-10 right-16 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-xl"
          >
            <Users className="w-10 h-10 text-primary-50" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, -25, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute bottom-0 left-32 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl"
          >
            <GraduationCap className="w-12 h-12 text-primary-50" />
          </motion.div>
          
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, 15, 0]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-10 right-8 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl"
          >
            <Award className="w-6 h-6 text-primary-50" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
