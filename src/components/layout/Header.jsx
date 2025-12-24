
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Code2, Menu, X, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';

const navLinks = [
  { name: 'DSA Visualization', path: '/dsa-visualization' },

];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleJoinClick = () => {
    window.open('https://nas.io/wecodecommunity', '_blank');
  };

  const handleNavClick = (e, path) => {
    setIsOpen(false); // Always close mobile menu
    
    if (path === '#') {
      e.preventDefault();
      toast({
        title: "Coming Soon! 🚧",
        description: "This page is currently under construction.",
      });
    }
  };

  const menuVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <div className="p-2 bg-cyan-400/10 rounded-lg">
            <Code2 className="h-7 w-7 text-cyan-400" />
          </div>
          <span className="gradient-text">WeCode</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <DropdownMenu key={link.name}>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white transition-colors outline-none data-[state=open]:text-white">
                    {link.name} <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-slate-950 border-slate-800">
                    {link.children.map((child) => (
                      <DropdownMenuItem key={child.name} className="focus:bg-slate-800 focus:text-white cursor-pointer" asChild>
                        <Link 
                          to={child.path} 
                          onClick={(e) => handleNavClick(e, child.path)} 
                          className="w-full block"
                        >
                          {child.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button onClick={handleJoinClick} variant="outline" size="sm" className="border-cyan-400/50 text-cyan-300">
            Join Community
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          variants={menuVariants}
          className="md:hidden bg-background/95 border-t border-slate-800"
        >
          <nav className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => {
              if (link.children) {
                return (
                  <div key={link.name} className="flex flex-col gap-2">
                    <span className="text-base font-medium text-slate-300">{link.name}</span>
                    <div className="pl-4 flex flex-col gap-2 border-l border-slate-800 ml-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.path}
                          onClick={(e) => handleNavClick(e, child.path)}
                          className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `text-base font-medium transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              );
            })}
            <Button onClick={handleJoinClick} variant="outline" className="w-full mt-2">
              Join Community
            </Button>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
