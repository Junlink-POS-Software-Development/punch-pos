import React, { useState, useMemo } from "react";
import { Edit2, Trash2, CheckSquare, Square, MoreHorizontal, Lock, Unlock, ArrowUpDown } from "lucide-react";
import { useCustomerData, useCustomerMutations } from "../hooks/useCustomerData";
import { useCustomerStore } from "../store/useCustomerStore";
import { updateCustomerGroup, deleteCustomer, bulkUpdateCustomerGroup, toggleCustomerLock } from "../api/services";

// Helper function to parse name parts from a full name
const parseNameParts = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: "", lastName: "" };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: "", lastName: parts[1] };
  }
  // Assume last part is last name, first part is first name, rest is middle
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleName = parts.slice(1, -1).join(" ");
  return { firstName, middleName, lastName };
};

// Format display name based on sort mode
const formatDisplayName = (fullName: string, sortByLastName: boolean): string => {
  if (!sortByLastName) return fullName;
  
  const { firstName, middleName, lastName } = parseNameParts(fullName);
  if (!lastName) return fullName;
  
  const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : "";
  return `${lastName}, ${firstName}${middleInitial}`;
};

// Get last name for sorting
const getLastName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : parts[0].toLowerCase();
};
export const CustomerTable = () => {
  const { customers, groups, isLoading } = useCustomerData();
  const { refreshData } = useCustomerMutations();
  const { setViewMode, setSelectedCustomerId } = useCustomerStore();
  
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [sortByLastName, setSortByLastName] = useState(false);

  // Sort customers based on the current mode
  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      if (sortByLastName) {
        return getLastName(a.full_name).localeCompare(getLastName(b.full_name));
      }
      return a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase());
    });
  }, [customers, sortByLastName]);
  const handleGroupChange = async (customerId: string, groupId: string, isLocked: boolean) => {
    if (isLocked) {
      alert("This customer is locked and cannot be moved.");
      return;
    }

    if (!confirm("Are you sure you want to move this customer to a different group?")) return;

    await updateCustomerGroup(customerId, groupId);
    refreshData();
  };

  const handleCustomerClick = (id: string) => {
    setSelectedCustomerId(id);
    setViewMode("detail");
  };

  const handleDelete = async (id: string, isLocked: boolean) => {
    if (isLocked) {
      alert("This customer is locked and cannot be deleted.");
      return;
    }
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await deleteCustomer(id);
    refreshData();
  };

  const handleLockToggle = async (e: React.MouseEvent, customer: any) => {
    e.stopPropagation();
    const newLockStatus = !customer.document_metadata?.isLocked;
    await toggleCustomerLock(customer.id, newLockStatus, customer.document_metadata || {});
    refreshData();
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedCustomerIds.size === customers.length) {
      setSelectedCustomerIds(new Set());
    } else {
      setSelectedCustomerIds(new Set(customers.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedCustomerIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCustomerIds(newSelected);
  };

  const handleBulkMove = async (groupId: string) => {
    if (selectedCustomerIds.size === 0) return;

    // Check for locked customers
    const selectedCustomers = customers.filter(c => selectedCustomerIds.has(c.id));
    const lockedCustomers = selectedCustomers.filter(c => c.document_metadata?.isLocked);

    if (lockedCustomers.length > 0) {
      alert(`Cannot move customers. ${lockedCustomers.length} selected customer(s) are locked.`);
      return;
    }

    if (!confirm(`Are you sure you want to move ${selectedCustomerIds.size} customers to this group?`)) return;

    await bulkUpdateCustomerGroup(Array.from(selectedCustomerIds), groupId);
    refreshData();
    setSelectedCustomerIds(new Set());
  };

  if (isLoading) return <div className="text-gray-500 text-center mt-20">Loading...</div>;

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex flex-col h-full">
      
      {/* Bulk Actions Header */}
      {selectedCustomerIds.size > 0 && (
        <div className="bg-blue-600/20 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-blue-200 text-sm font-medium px-2">
            {selectedCustomerIds.size} selected
          </span>
          <div className="flex items-center gap-3">
             <span className="text-gray-400 text-xs">Move to:</span>
             <select
                onChange={(e) => handleBulkMove(e.target.value)}
                className="bg-gray-900 border border-gray-600 text-xs text-white rounded px-2 py-1.5 outline-none focus:border-blue-500"
                defaultValue=""
             >
                <option value="" disabled>Select Group</option>
                <option value="ungrouped">Ungrouped</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
             </select>
          </div>
        </div>
      )}

      <div className="overflow-x-auto w-full h-full">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-900/50 text-gray-400 text-xs font-bold uppercase sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="p-5 w-10">
                <button onClick={toggleSelectAll} className="hover:text-white">
                  {customers.length > 0 && selectedCustomerIds.size === customers.length ? (
                    <CheckSquare size={16} className="text-blue-500" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="p-5">
                <button 
                  onClick={() => setSortByLastName(!sortByLastName)}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                  title={sortByLastName ? "Sorting by Last Name" : "Sorting by First Name"}
                >
                  Name
                  <ArrowUpDown size={14} className={sortByLastName ? "text-blue-400" : ""} />
                  <span className="text-[10px] font-normal normal-case opacity-70">
                    ({sortByLastName ? "Last Name" : "First Name"})
                  </span>
                </button>
              </th>
              <th className="p-5">Contact</th>
              <th className="p-5">Group</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {sortedCustomers.map((c) => {
              const isLocked = c.document_metadata?.isLocked || false;
              return (
                <tr 
                  key={c.id} 
                  className={`hover:bg-gray-700/30 transition group ${selectedCustomerIds.has(c.id) ? "bg-blue-500/10" : ""}`}
                >
                  <td className="p-5">
                    <button onClick={() => toggleSelect(c.id)} className="hover:text-white text-gray-500">
                      {selectedCustomerIds.has(c.id) ? (
                        <CheckSquare size={16} className="text-blue-500" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>
                  <td className="p-5 font-medium text-white">
                    <button 
                      onClick={() => handleCustomerClick(c.id)}
                      className="flex items-center gap-3 text-left w-full hover:text-blue-400 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0 relative">
                        {c.full_name.charAt(0).toUpperCase()}
                        {isLocked && (
                          <div className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-0.5">
                            <Lock size={10} className="text-yellow-500" />
                          </div>
                        )}
                      </div>
                      {formatDisplayName(c.full_name, sortByLastName)}
                    </button>
                  </td>
                  <td className="p-5 text-gray-400">{c.phone_number || "-"}</td>
                  <td className="p-5">
                     <select
                      value={c.group_id || "ungrouped"}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleGroupChange(c.id, e.target.value, isLocked)}
                      className={`bg-gray-900 border border-gray-700 text-xs text-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      // disabled={isLocked} // Optional: strictly disable it
                    >
                      <option value="ungrouped">Ungrouped</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                          onClick={(e) => handleLockToggle(e, c)}
                          className={`${isLocked ? "text-yellow-500 hover:text-yellow-400" : "text-gray-500 hover:text-gray-300"}`}
                          title={isLocked ? "Unlock Customer" : "Lock Customer"}
                      >
                          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                      <button 
                          onClick={() => handleCustomerClick(c.id)}
                          className="text-gray-400 hover:text-blue-400" 
                          title="Edit"
                      >
                          <Edit2 size={16} />
                      </button>
                      <button 
                          onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(c.id, isLocked);
                          }}
                          className={`text-gray-400 hover:text-red-400 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Delete"
                      >
                          <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};