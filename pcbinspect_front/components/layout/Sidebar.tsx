"use client";
import { useAuth } from '@/app/context/AuthContext';
import { BarChartBig, CircuitBoard, CpuIcon, Icon, LayoutGrid, LogOut, LucideHistory, PlaneIcon, PlayCircleIcon, SquareActivityIcon , Users,
  Package,
  Focus} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'
interface NavItem{
  href:string;
  label:string;
  icon:React.ComponentType<{size?:number|string;className?:string}>;
  roles:string[];
}
const NAV_ITEMS:NavItem[]=[
  {href:'/dashboard',label:"Dashboard",icon:LayoutGrid,roles:["ADMIN","INGENIEUR","TECHNICIEN","OPERATEUR"]},
  {href:'/dashboard/production',label:"Production",icon:PlayCircleIcon,roles:["ADMIN","INGENIEUR","TECHNICIEN","OPERATEUR"]},
  {href:'/dashboard/pcb_card',label:"PCB Cards",icon:CircuitBoard,roles:["ADMIN","INGENIEUR","TECHNICIEN","OPERATEUR"]},
  {href:'/dashboard/history',label:"History",icon:LucideHistory,roles:["ADMIN","INGENIEUR","TECHNICIEN","OPERATEUR"]},
  {href:'/dashboard/statistics',label:"Statistics",icon:BarChartBig,roles:["ADMIN","INGENIEUR","TECHNICIEN","OPERATEUR"]},
  {href:'/dashboard/teaching',label:"Teaching",icon:CpuIcon,roles:["ADMIN","INGENIEUR","TECHNICIEN"]},
  {href:'/dashboard/products',label:"Produits",icon:Package,roles:["ADMIN","INGENIEUR"]},
  {href:'/dashboard/users',label:"Users",icon:Users,roles:["ADMIN"]},

];
function Sidebar() {
  const pathname=usePathname();
  const router=useRouter();
  const {user}=useAuth();
  const userRole = user?.role;
  const handleLogout=()=>{
    localStorage.removeItem("accessToken");
    router.push("/login");
  }
  return (
    <aside className='flex h-screen w-64 flex-col border-r border-border bg-muted dark:bg-[#0d3333]
        dark:border-[#1d5555c9]'>
    <div className="flex items-center gap-2.5 px-6 py-6    dark:border-[#1d5555]
">
      <span className="flex h-10 w-120 items-center justify-center rounded-lg bg-ink text-white dark:bg-[#155454]">
        <Image  src="/images/Logo.png" alt="logo" width={38}

        height={40}
        />
      </span>
       <div
        className="
          px-6
          py-6
          border-b
          border-border
          dark:border-[#1d5555]
        "
      >
      <h1
          className="
            text-xl
            font-bold
            text-text-primary
            dark:text-white
          "
        >
          PCBInspect
        </h1>
            <p
          className="
            mt-1
            text-xs
            font-medium
            text-teal-600
            dark:text-teal-300
          "
        >
          Inspection System
        </p>
        </div>
    </div>

<nav className='flex-1 space-y-1 px-3 pt-4'>
{NAV_ITEMS
    .filter(item => 
      item.roles.includes(userRole ?? "")
    )
    .map(({href,label,icon:Icon})=>{
        const isActive=pathname===href;
    return(
    <Link
      key={href}
      href={href}
      className={`flex items-center gap-3 rounded-xl  px-4 py-3 text-sm font-medium transition-colors ${
        isActive
        ?`bg-primary text-white
        dark:bg-[#155454]
        dark:text-white
        `
        :`text-gray-600 hover:bg-gray-200/60 
          dark:text-teal-100 dark:hover:bg-[#124545] dark:hover:text-white
        `
      }`}
      >
        <Icon size={20}/>
        {label}
        </Link>
    );
  })}
  </nav>

  <div className='border-t border-border px-3 py-4 drak:border-[#155454]'>
  <button
    onClick={handleLogout}
    className='group flex w-full items-center gap-2 rounded-xl px-4 text-sm font-medium'
  >
    <LogOut
      size={20}
      className='text-red-500 group-hover:text-red-700 dark:text-red-300 '
    />

    <span className='text-red-500 group-hover:text-red-700 dark:text-red-300  '>
      Logout
    </span>

  </button>
</div>


    </aside>
    
      
);

}

export default Sidebar
