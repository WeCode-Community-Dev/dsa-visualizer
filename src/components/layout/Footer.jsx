
import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Youtube, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
  const { toast } = useToast();

  const handleNewsletterSubmit = e => {
    e.preventDefault();
    toast({
      title: "This feature is not yet enabled in our current version !!",
      description: "We are working on developing our newsletter soon and we will announce it in our social media channels"
    });
    e.target.reset();
  };

  return (
    <footer className="bg-background/50 border-t border-white/10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-4 md:px-6 py-16">
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <div className="p-2 bg-cyan-400/10 rounded-lg">
              <Code2 className="h-7 w-7 text-cyan-400" />
            </div>
            <span className="gradient-text">WeCode</span>
          </Link>
          <p className="text-sm text-slate-400">Join the Future of Tech. Together.</p>
          <div className="flex gap-4 mt-2">
            <a href='https://youtube.com/@wecodemalayalam?sub_confirmation=1' target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-300 hover:bg-white/10 p-2 rounded-md transition-colors duration-200">
              <Youtube className="h-5 w-5" />
            </a>
            <a href='https://instagram.com/wecodemalayalam' target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-300 hover:bg-white/10 p-2 rounded-md transition-colors duration-200">
              <Instagram className="h-5 w-5" />
            </a>
            <a href='https://linkedin.com/company/wecode-community' target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-300 hover:bg-white/10 p-2 rounded-md transition-colors duration-200">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        
        
      </div>
      <div className="border-t border-white/10 py-6">
        <p className="text-center text-sm text-slate-500">
          © {new Date().getFullYear()} WeCode Community. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
export default Footer;
