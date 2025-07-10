@@ .. @@
   const validateForm = (): boolean => {
     // Validate ticket types
     if (ticketTypes.some(type => !type.name)) {
       setError('All ticket types must have a name');
       return false;
     }
     
+    // Validate capacities against event max attendees per day
+    const totalCapacityPerDay = ticketTypes
+      .filter(type => type.affects_capacity)
+      .reduce((sum, type) => sum + (type.capacity || 0), 0);
+      
+    if (venueCapacity && totalCapacityPerDay > venueCapacity) {
+      setError(`Total ticket capacity (${totalCapacityPerDay}) exceeds the maximum daily capacity (${venueCapacity})`);
+      return false;
+    }
+    
     // Validate dependencies - ensure no dependencies on unsaved tickets
     const tempTicketIds = ticketTypes
       .filter(ticket => ticket.id && typeof ticket.id === 'string' && ticket.id.startsWith('temp-'))
@@ .. @@
                 <div className="flex items-center space-x-2 text-sm">
                   <MapPin className="w-4 h-4 text-gray-400" />
                   <span>Booth {artist.booth_number}</span>
                 </div>
@@ .. @@
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     Capacity (optional)
                   </label>
+                  <p className="text-gray-400 text-xs mb-1">
+                    Number of tickets available per day
+                  </p>
                   <input
                     type="number"
                     value={ticketType.capacity || ''}
@@ .. @@
                   <div className="flex items-center mt-1">
                     <input
                       type="checkbox"
                       checked={ticketType.affects_capacity}
                       onChange={(e) => updateTicketType(ticketType.id!, { affects_capacity: e.target.checked })}
                       className="text-purple-600 focus:ring-purple-500 rounded mr-2"
                     />
-                    <span className="text-gray-400 text-xs">Affects venue capacity</span>
+                    
}<span className="text-gray-400 text-xs">Counts toward daily capacity limit</span>
                   </div>
                 </div>