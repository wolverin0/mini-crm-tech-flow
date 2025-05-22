import { getInvoices } from './invoiceService';
import { getReceipts } from './receiptService';
import { getClients } from './clientService';
import { getRepairOrders } from './repairOrderService';
import { getItems as getInventoryItems } from './inventoryService'; // Renamed to avoid conflict if getItems is used elsewhere
import { Invoice, Order as RepairOrder, InventoryItem, Client } from '@/types'; // Assuming necessary types are available
import { differenceInDays, intervalToDuration, format as formatDateFns } from 'date-fns';
// Define other necessary types as we go, or import if they exist

/**
 * 1. Monthly Sales Summary
 * Fetches Invoice and Receipt data.
 * Calculates and returns: { totalInvoiced: number, totalCollected: number, numberOfInvoices: number }.
 */
export const getMonthlySalesSummary = async (month: number, year: number): Promise<{ totalInvoiced: number, totalCollected: number, numberOfInvoices: number }> => {
  try {
    const invoices = await getInvoices();
    const receipts = await getReceipts();

    const relevantInvoices = invoices.filter(invoice => {
      const issueDate = new Date(invoice.issue_date);
      return issueDate.getMonth() + 1 === month && issueDate.getFullYear() === year;
    });

    const totalInvoiced = relevantInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const numberOfInvoices = relevantInvoices.length;

    const relevantReceipts = receipts.filter(receipt => {
      const paymentDate = new Date(receipt.payment_date);
      return paymentDate.getMonth() + 1 === month && paymentDate.getFullYear() === year;
    });

    const totalCollected = relevantReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);

    return { totalInvoiced, totalCollected, numberOfInvoices };
  } catch (error) {
    console.error("Error in getMonthlySalesSummary:", error);
    throw error;
  }
};

// --- Ticket Reports ---

// Placeholder Ticket interface (adjust based on actual src/types/index.ts if it exists)
interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Pending Client Response'; // Example statuses
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'; // Example priorities
  client_id?: string | null;
  assigned_to?: string | null; // Assuming this is a User ID
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
  resolved_at?: string | null; // ISO Date string, hypothetical
}

// Mock function to simulate fetching tickets (replace with actual service call if available)
const getTickets = async (): Promise<Ticket[]> => {
  // Sample data for mocking
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  return [
    { id: 'TICKET001', title: 'Login Issue', status: 'Resolved', priority: 'High', client_id: 'CLIENT001', assigned_to: 'USER001', created_at: lastWeek.toISOString(), updated_at: yesterday.toISOString(), resolved_at: yesterday.toISOString() },
    { id: 'TICKET002', title: 'Payment Failed', status: 'In Progress', priority: 'Urgent', client_id: 'CLIENT002', assigned_to: 'USER002', created_at: twoDaysAgo.toISOString(), updated_at: today.toISOString() },
    { id: 'TICKET003', title: 'Feature Request', status: 'Open', priority: 'Medium', client_id: 'CLIENT001', created_at: yesterday.toISOString(), updated_at: yesterday.toISOString() },
    { id: 'TICKET004', title: 'UI Glitch', status: 'Closed', priority: 'Low', client_id: 'CLIENT003', assigned_to: 'USER001', created_at: lastWeek.toISOString(), updated_at: twoDaysAgo.toISOString(), resolved_at: twoDaysAgo.toISOString() },
    { id: 'TICKET005', title: 'Documentation Error', status: 'Resolved', priority: 'Medium', client_id: 'CLIENT004', assigned_to: 'USER003', created_at: twoDaysAgo.toISOString(), updated_at: today.toISOString(), resolved_at: today.toISOString()},
  ];
};


/**
 * 1. Ticket Volume & Resolution
 * Fetches Ticket data. Filters by created_at within the date range and applies other filters.
 * Calculates: Total created, total resolved, counts by status/priority, average resolution time.
 * Returns: Promise of specified structure.
 */
export const getTicketVolumeAndResolution = async (
  startDate: string, 
  endDate: string, 
  filters?: { priority?: string, assignedTo?: string, status?: string }
): Promise<{
  createdCount: number;
  resolvedCount: number;
  byStatus: Array<{ status: string, count: number }>;
  byPriority: Array<{ priority: string, count: number }>;
  averageResolutionTime?: number; // in days
}> => {
  try {
    let tickets = await getTickets(); // Using the mock function
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter by creation date range
    tickets = tickets.filter(ticket => {
      const createdAtDate = new Date(ticket.created_at);
      return createdAtDate >= start && createdAtDate <= end;
    });

    // Apply additional filters
    if (filters) {
      if (filters.priority) {
        tickets = tickets.filter(ticket => ticket.priority === filters.priority);
      }
      if (filters.assignedTo) {
        tickets = tickets.filter(ticket => ticket.assigned_to === filters.assignedTo);
      }
      if (filters.status) {
        tickets = tickets.filter(ticket => ticket.status === filters.status);
      }
    }

    const createdCount = tickets.length;

    const resolvedTickets = tickets.filter(ticket => 
      (ticket.status === 'Resolved' || ticket.status === 'Closed') && ticket.resolved_at
    );
    const resolvedCount = resolvedTickets.length;
    
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    
    tickets.forEach(ticket => {
      byStatus[ticket.status] = (byStatus[ticket.status] || 0) + 1;
      byPriority[ticket.priority] = (byPriority[ticket.priority] || 0) + 1;
    });

    let totalResolutionTime = 0;
    let resolvableTicketsCount = 0;

    resolvedTickets.forEach(ticket => {
      if (ticket.resolved_at) { // resolved_at must exist
        const createdAt = new Date(ticket.created_at);
        const resolvedAt = new Date(ticket.resolved_at);
        // Only consider tickets resolved within the specified period for average time calculation
        if (resolvedAt >= start && resolvedAt <= end) {
            totalResolutionTime += differenceInDays(resolvedAt, createdAt);
            resolvableTicketsCount++;
        }
      }
    });
    
    const averageResolutionTime = resolvableTicketsCount > 0 ? totalResolutionTime / resolvableTicketsCount : undefined;

    return {
      createdCount,
      resolvedCount,
      byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
      byPriority: Object.entries(byPriority).map(([priority, count]) => ({ priority, count })),
      averageResolutionTime,
    };

  } catch (error) {
    console.error("Error in getTicketVolumeAndResolution:", error);
    throw error;
  }
};

// --- Client Reports ---

/**
 * 1. New Client Acquisition
 * Fetches Client data. Filters by created_at within the date range.
 * Counts clients, grouping by month (YYYY-MM).
 * Returns: Promise<Array<{ period: string, newClientCount: number }>>.
 */
export const getNewClientCount = async (startDate: string, endDate: string): Promise<Array<{ period: string, newClientCount: number }>> => {
  try {
    const clients = await getClients();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const relevantClients = clients.filter(client => {
      // Ensure created_at is present and valid before creating a Date object
      if (!client.created_at) return false;
      const createdAtDate = new Date(client.created_at);
      return createdAtDate >= start && createdAtDate <= end;
    });

    const countsByPeriod: Record<string, number> = {};
    relevantClients.forEach(client => {
      // Ensure created_at is present
      if (!client.created_at) return;
      const period = formatDateFns(new Date(client.created_at), 'yyyy-MM');
      countsByPeriod[period] = (countsByPeriod[period] || 0) + 1;
    });

    return Object.entries(countsByPeriod).map(([period, newClientCount]) => ({
      period,
      newClientCount,
    }));
  } catch (error) {
    console.error("Error in getNewClientCount:", error);
    throw error;
  }
};

/**
 * 2. Client Activity Summary
 * Fetches Client, RepairOrder, and Invoice data.
 * For each client, aggregates count of repair orders and sum of invoice totals within a date range.
 * Returns: Promise<Array<{ clientId: string, clientName: string, numberOfOrders: number, totalInvoicedAmount: number }>>.
 */
export const getClientActivitySummary = async (startDate: string, endDate: string): Promise<Array<{ clientId: string, clientName: string, numberOfOrders: number, totalInvoicedAmount: number }>> => {
  try {
    const clients = await getClients();
    const repairOrders = await getRepairOrders();
    const invoices = await getInvoices();

    const start = new Date(startDate);
    const end = new Date(endDate);

    const clientSummaries = clients.map(client => {
      const clientOrders = repairOrders.filter(order => {
        if (order.client_id !== client.id) return false;
        // Ensure entry_date is present
        if(!order.entry_date) return false;
        const entryDate = new Date(order.entry_date);
        return entryDate >= start && entryDate <= end;
      });

      const clientInvoices = invoices.filter(invoice => {
        if (invoice.client_id !== client.id) return false;
        // Ensure issue_date is present
        if (!invoice.issue_date) return false;
        const issueDate = new Date(invoice.issue_date);
        return issueDate >= start && issueDate <= end;
      });

      const totalInvoicedAmount = clientInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

      return {
        clientId: client.id,
        // Assuming client object has 'name' and potentially 'last_name'
        clientName: `${client.name} ${client.last_name || ''}`.trim(), 
        numberOfOrders: clientOrders.length,
        totalInvoicedAmount,
      };
    });

    return clientSummaries;
  } catch (error) {
    console.error("Error in getClientActivitySummary:", error);
    throw error;
  }
};

// --- Inventory Reports ---

/**
 * 1. Stock Status Report
 * Fetches InventoryItem data. Applies filters if provided.
 * Calculates totalValue and identifies low stock items.
 * Returns: Promise<Array<{ itemId: string, itemName: string, sku: string | null, category: string | null, quantity: number, costPrice: number, sellingPrice: number, totalValue: number, minimumStock: number | null, isLowStock: boolean }>>.
 */
export const getStockStatus = async (filters?: { category?: string, supplierId?: string }): Promise<Array<{ 
  itemId: string, 
  itemName: string, 
  sku: string | null, 
  category: string | null, 
  quantity: number, 
  costPrice: number, 
  sellingPrice: number, 
  totalValue: number, 
  minimumStock: number | null, 
  isLowStock: boolean 
}>> => {
  try {
    let items = await getInventoryItems();

    if (filters) {
      if (filters.category) {
        items = items.filter(item => item.category === filters.category);
      }
      if (filters.supplierId) {
        // Assuming InventoryItem has a supplier_id property
        items = items.filter(item => item.supplier_id === filters.supplierId);
      }
    }

    return items.map(item => {
      const totalValue = item.quantity * item.cost_price;
      const isLowStock = item.quantity <= (item.minimum_stock || 0);
      
      return {
        itemId: item.id,
        itemName: item.name,
        sku: item.sku || null,
        category: item.category || null,
        quantity: item.quantity,
        costPrice: item.cost_price,
        sellingPrice: item.price, // Assuming 'price' is the selling price
        totalValue,
        minimumStock: item.minimum_stock || null,
        isLowStock,
      };
    });
  } catch (error) {
    console.error("Error in getStockStatus:", error);
    throw error;
  }
};

/**
 * 4. Orders by Equipment Type/Brand
 * Fetches RepairOrder data. Filters by entry_date if startDate and endDate are provided.
 * Groups by the specified field (equipment_type or equipment_brand).
 * Calculates: Count of orders for each group.
 * Returns: Promise<Array<{ groupName: string, count: number }>>.
 */
export const getOrdersByEquipment = async (startDate?: string, endDate?: string, groupBy: 'equipment_type' | 'equipment_brand' = 'equipment_type'): Promise<Array<{ groupName: string, count: number }>> => {
  try {
    let orders = await getRepairOrders();

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      orders = orders.filter(order => {
        const entryDate = new Date(order.entry_date);
        return entryDate >= start && entryDate <= end;
      });
    }

    const countsByGroup: Record<string, number> = {};
    orders.forEach(order => {
      const groupKey = order[groupBy]; // Access property based on groupBy parameter
      if (groupKey) { // Ensure the key exists and is not null/undefined
        countsByGroup[groupKey] = (countsByGroup[groupKey] || 0) + 1;
      } else {
        // Handle cases where the groupBy field might be missing on some orders
        const unknownGroup = `Unknown ${groupBy.replace('_', ' ')}`;
        countsByGroup[unknownGroup] = (countsByGroup[unknownGroup] || 0) + 1;
      }
    });

    return Object.entries(countsByGroup).map(([groupName, count]) => ({
      groupName,
      count,
    }));
  } catch (error) {
    console.error("Error in getOrdersByEquipment:", error);
    throw error;
  }
};

/**
 * 3. Technician Performance
 * Fetches completed RepairOrder data. Filters by completion_date if startDate and endDate are provided.
 * Groups by RepairOrder.assigned_technician_id.
 * Calculates: Count of completed orders and average repair time per technician.
 * Returns: Promise<Array<{ technicianId: string | null, technicianName?: string, ordersCompleted: number, averageRepairTime: number }>> (time in days).
 */
export const getTechnicianPerformance = async (startDate?: string, endDate?: string): Promise<Array<{ technicianId: string | null, technicianName?: string, ordersCompleted: number, averageRepairTime: number }>> => {
  try {
    let orders = await getRepairOrders();
    // const users = await getUsers(); // Removed this line

    // Filter for completed orders that have an assigned technician
    orders = orders.filter(order => order.completion_date && order.assigned_technician_id);

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      orders = orders.filter(order => {
        // Ensure completion_date is not null
        if (!order.completion_date) return false;
        const completionDate = new Date(order.completion_date);
        return completionDate >= start && completionDate <= end;
      });
    }

    const performanceByTechnician: Record<string, { ordersCompleted: number, totalRepairTime: number, technicianName?: string }> = {};

    for (const order of orders) {
      // This check is partially redundant due to the filter above, but good for type safety
      if (order.assigned_technician_id && order.completion_date) {
        const technicianId = order.assigned_technician_id;

        if (!performanceByTechnician[technicianId]) {
          // const technicianUser = users.find(u => u.id === technicianId); // Removed user lookup
          performanceByTechnician[technicianId] = {
            ordersCompleted: 0,
            totalRepairTime: 0,
            // Set technicianName to technicianId as a placeholder, or undefined
            technicianName: technicianId, // Or undefined, if preferred to completely remove it when not found
          };
        }

        const entryDate = new Date(order.entry_date);
        const completionDate = new Date(order.completion_date); // completion_date is confirmed not null
        const repairTime = differenceInDays(completionDate, entryDate);

        performanceByTechnician[technicianId].ordersCompleted += 1;
        performanceByTechnician[technicianId].totalRepairTime += repairTime;
      }
    }

    return Object.entries(performanceByTechnician).map(([technicianId, data]) => ({
      technicianId,
      technicianName: data.technicianName,
      ordersCompleted: data.ordersCompleted,
      averageRepairTime: data.ordersCompleted > 0 ? data.totalRepairTime / data.ordersCompleted : 0,
    }));

  } catch (error) {
    console.error("Error in getTechnicianPerformance:", error);
    throw error;
  }
};

/**
 * 2. Average Repair Time
 * Fetches completed RepairOrder data. Filters by completion_date if startDate and endDate are provided.
 * Calculates duration (completion_date - entry_date) for each.
 * Calculates average duration.
 * Optionally, also group by RepairOrder.equipment_type and calculate average time for each.
 * Returns: Promise<{ overallAverageTime: number, byEquipmentType?: Array<{ equipmentType: string, averageTime: number }> }> (time in days).
 */
export const getAverageRepairTime = async (startDate?: string, endDate?: string, groupByEquipmentType: boolean = false): Promise<{ overallAverageTime: number, byEquipmentType?: Array<{ equipmentType: string, averageTime: number }> }> => {
  try {
    let orders = await getRepairOrders();

    // Filter for completed orders
    orders = orders.filter(order => order.completion_date);

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      orders = orders.filter(order => {
        // Ensure completion_date is not null before creating a Date object
        if (!order.completion_date) return false;
        const completionDate = new Date(order.completion_date);
        return completionDate >= start && completionDate <= end;
      });
    }

    if (orders.length === 0) {
      return { overallAverageTime: 0, byEquipmentType: groupByEquipmentType ? [] : undefined };
    }

    const repairTimes = orders.map(order => {
      const entryDate = new Date(order.entry_date);
      // Ensure completion_date is not null
      const completionDate = order.completion_date ? new Date(order.completion_date) : new Date(); 
      const duration = differenceInDays(completionDate, entryDate);
      return { duration, equipmentType: order.equipment_type };
    });

    const totalRepairTime = repairTimes.reduce((sum, rt) => sum + rt.duration, 0);
    const overallAverageTime = totalRepairTime / repairTimes.length;

    let byEquipmentType: Array<{ equipmentType: string, averageTime: number }> | undefined = undefined;
    if (groupByEquipmentType) {
      const timesByEquipment: Record<string, { totalDuration: number, count: number }> = {};
      repairTimes.forEach(rt => {
        if (rt.equipmentType) {
          if (!timesByEquipment[rt.equipmentType]) {
            timesByEquipment[rt.equipmentType] = { totalDuration: 0, count: 0 };
          }
          timesByEquipment[rt.equipmentType].totalDuration += rt.duration;
          timesByEquipment[rt.equipmentType].count += 1;
        }
      });

      byEquipmentType = Object.entries(timesByEquipment).map(([equipmentType, data]) => ({
        equipmentType,
        averageTime: data.totalDuration / data.count,
      }));
    }

    return { overallAverageTime, byEquipmentType };
  } catch (error) {
    console.error("Error in getAverageRepairTime:", error);
    throw error;
  }
};

/**
 * 2. Sales by Client
 * Fetches Invoice and Client data.
 * Groups invoices by client_id, sums Invoice.total.
 * Returns: Promise<Array<{ clientId: string, clientName: string, totalInvoiced: number }>>.
 */
export const getSalesByClient = async (startDate: string, endDate: string): Promise<Array<{ clientId: string, clientName: string, totalInvoiced: number }>> => {
  try {
    const invoices = await getInvoices();
    const clients = await getClients() as Client[]; // Cast to Client[]

    const start = new Date(startDate);
    const end = new Date(endDate);

    const relevantInvoices = invoices.filter(invoice => {
      const issueDate = new Date(invoice.issue_date);
      return issueDate >= start && issueDate <= end;
    });

    const salesByClient: Record<string, { totalInvoiced: number, clientName: string }> = {};

    for (const invoice of relevantInvoices) {
      if (invoice.client_id) {
        if (!salesByClient[invoice.client_id]) {
          const client = clients.find(c => c.id === invoice.client_id);
          salesByClient[invoice.client_id] = {
            totalInvoiced: 0,
            clientName: client ? client.name : 'Unknown Client',
          };
        }
        salesByClient[invoice.client_id].totalInvoiced += invoice.total;
      }
    }

    return Object.entries(salesByClient).map(([clientId, data]) => ({
      clientId,
      clientName: data.clientName,
      totalInvoiced: data.totalInvoiced,
    }));

  } catch (error) {
    console.error("Error in getSalesByClient:", error);
    throw error;
  }
};

/**
 * 3. Invoice Aging Report
 * Fetches Invoice data.
 * Calculates age of unpaid invoices (asOfDate - Invoice.due_date or issue_date).
 * Groups amounts by age buckets (0-30, 31-60, 61-90, 90+ days).
 * Returns: Promise<Array<{ ageBucket: string, totalAmount: number, numberOfInvoices: number }>>.
 */
export const getInvoiceAging = async (asOfDate: string): Promise<Array<{ ageBucket: string, totalAmount: number, numberOfInvoices: number }>> => {
  try {
    const invoices = await getInvoices();
    const dateAsOf = new Date(asOfDate);

    const agingBuckets: Record<string, { totalAmount: number, numberOfInvoices: number }> = {
      "0-30 days": { totalAmount: 0, numberOfInvoices: 0 },
      "31-60 days": { totalAmount: 0, numberOfInvoices: 0 },
      "61-90 days": { totalAmount: 0, numberOfInvoices: 0 },
      "90+ days": { totalAmount: 0, numberOfInvoices: 0 },
    };

    const unpaidInvoices = invoices.filter(
      (invoice) => invoice.status !== "Pagada" && invoice.status !== "Paid" // Assuming 'Paid' is another status for paid invoices
    );

    for (const invoice of unpaidInvoices) {
      const dateToCompare = invoice.due_date ? new Date(invoice.due_date) : new Date(invoice.issue_date);
      const age = differenceInDays(dateAsOf, dateToCompare);

      let bucketKey: string;
      if (age <= 30) {
        bucketKey = "0-30 days";
      } else if (age <= 60) {
        bucketKey = "31-60 days";
      } else if (age <= 90) {
        bucketKey = "61-90 days";
      } else {
        bucketKey = "90+ days";
      }

      agingBuckets[bucketKey].totalAmount += invoice.total;
      agingBuckets[bucketKey].numberOfInvoices += 1;
    }

    return Object.entries(agingBuckets).map(([ageBucket, data]) => ({
      ageBucket,
      totalAmount: data.totalAmount,
      numberOfInvoices: data.numberOfInvoices,
    }));

  } catch (error) {
    console.error("Error in getInvoiceAging:", error);
    throw error;
  }
};



/**
 * 4. Revenue by Service Type (from Repair Orders)
 * Fetches Invoice and RepairOrder data.
 * Links invoices to repair orders, groups by RepairOrder.equipment_type.
 * Sums Invoice.total for each equipment type.
 * Returns: Promise<Array<{ equipmentType: string, totalRevenue: number }>>.
 */
export const getRevenueByServiceType = async (startDate: string, endDate: string): Promise<Array<{ equipmentType: string, totalRevenue: number }>> => {
  try {
    const invoices = await getInvoices();
    const repairOrders = await getRepairOrders() as RepairOrder[]; // Cast to RepairOrder[]

    const start = new Date(startDate);
    const end = new Date(endDate);

    const relevantInvoices = invoices.filter(invoice => {
      const issueDate = new Date(invoice.issue_date);
      return issueDate >= start && issueDate <= end && invoice.repair_order_id;
    });

    const revenueByServiceType: Record<string, { totalRevenue: number }> = {};

    for (const invoice of relevantInvoices) {
      const repairOrder = repairOrders.find(ro => ro.id === invoice.repair_order_id);
      if (repairOrder && repairOrder.equipment_type) {
        const equipmentType = repairOrder.equipment_type;
        if (!revenueByServiceType[equipmentType]) {
          revenueByServiceType[equipmentType] = { totalRevenue: 0 };
        }
        revenueByServiceType[equipmentType].totalRevenue += invoice.total;
      }
    }

    return Object.entries(revenueByServiceType).map(([equipmentType, data]) => ({
      equipmentType,
      totalRevenue: data.totalRevenue,
    }));

  } catch (error) {
    console.error("Error in getRevenueByServiceType:", error);
    throw error;
  }
};

// --- Repair Order Reports ---

/**
 * 1. Order Status Overview
 * Fetches RepairOrder data. Filters by entry_date if startDate and endDate are provided.
 * Counts orders grouped by RepairOrder.status.
 * Returns: Promise<Array<{ status: string, count: number }>>.
 */
export const getOrderStatusCounts = async (startDate?: string, endDate?: string): Promise<Array<{ status: string, count: number }>> => {
  try {
    let orders = await getRepairOrders();

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      orders = orders.filter(order => {
        const entryDate = new Date(order.entry_date);
        return entryDate >= start && entryDate <= end;
      });
    }

    const statusCounts: Record<string, number> = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  } catch (error) {
    console.error("Error in getOrderStatusCounts:", error);
    throw error;
  }
};
