
import React from 'react';
import { motion } from 'framer-motion';
import { Github, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dsaContributors } from '@/data/contributors';
import { cn } from '@/lib/utils';

const ContributorsSection = ({ darkMode }) => {
  return (
    <div className="mt-16 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-cyan-400" />
        <h2 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-slate-900")}>Contributors to this page</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {dsaContributors.map((contributor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
            whileHover={{ y: -5 }}
          >
            <Card className={cn(
              "h-full overflow-hidden border-0 shadow-lg transition-all duration-300 group",
              darkMode ? "bg-slate-900/50 hover:bg-slate-800" : "bg-white hover:bg-slate-50"
            )}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-400/30 group-hover:border-cyan-400 transition-colors shadow-lg">
                    <img
                      src={contributor.avatar}
                      alt={contributor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h3 className={cn("font-bold text-sm mb-1", darkMode ? "text-slate-200" : "text-slate-900")}>{contributor.name}</h3>
                <p className={cn("text-xs mb-3", darkMode ? "text-slate-500" : "text-slate-600")}>{contributor.role}</p>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn("text-xs mb-3", darkMode ? "text-slate-500" : "text-slate-600",
                    "w-full h-8 gap-2 border border-slate-700/20 hover:text-cyan-400",
                    darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
                  )}
                >
                  <a href={contributor.github} target="_blank" rel="noopener noreferrer">
                    <Github className="w-3 h-3" />
                    GitHub
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ContributorsSection;
