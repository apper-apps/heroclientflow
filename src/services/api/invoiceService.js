import { toast } from 'react-toastify';

export const getAllInvoices = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "clientId" } },
        { field: { Name: "projectId" } },
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "paymentDate" } }
      ],
      orderBy: [
        {
          fieldName: "dueDate",
          sorttype: "DESC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords('invoice', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    toast.error("Failed to fetch invoices");
    return [];
  }
};

export const getInvoiceById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "clientId" } },
        { field: { Name: "projectId" } },
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "paymentDate" } }
      ]
    };
    
    const response = await apperClient.getRecordById('invoice', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    toast.error("Failed to fetch invoice");
    return null;
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    // Validate required fields
    if (!invoiceData.projectId) {
      toast.error("Project ID is required");
      return null;
    }
    if (!invoiceData.amount || parseFloat(invoiceData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return null;
    }
    if (!invoiceData.dueDate) {
      toast.error("Due date is required");
      return null;
    }
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include Updateable fields
    const params = {
      records: [{
        Name: invoiceData.Name || `Invoice ${Date.now()}`,
        Tags: invoiceData.Tags || '',
        Owner: invoiceData.Owner || null,
        clientId: parseInt(invoiceData.clientId) || null,
        projectId: parseInt(invoiceData.projectId),
        amount: parseFloat(invoiceData.amount),
        status: invoiceData.status || 'draft',
        dueDate: invoiceData.dueDate,
        paymentDate: invoiceData.paymentDate || null
      }]
    };
    
    const response = await apperClient.createRecord('invoice', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success("Invoice created successfully");
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating invoice:", error);
    toast.error("Failed to create invoice");
    return null;
  }
};

export const updateInvoice = async (id, invoiceData) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      toast.error("Invalid invoice ID");
      return null;
    }
    
    // Validate data if provided
    if (invoiceData.amount !== undefined && parseFloat(invoiceData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return null;
    }
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parsedId,
        Name: invoiceData.Name,
        Tags: invoiceData.Tags,
        Owner: invoiceData.Owner,
        clientId: invoiceData.clientId ? parseInt(invoiceData.clientId) : undefined,
        projectId: invoiceData.projectId ? parseInt(invoiceData.projectId) : undefined,
        amount: invoiceData.amount !== undefined ? parseFloat(invoiceData.amount) : undefined,
        status: invoiceData.status,
        dueDate: invoiceData.dueDate,
        paymentDate: invoiceData.paymentDate
      }]
    };
    
    const response = await apperClient.updateRecord('invoice', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success("Invoice updated successfully");
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating invoice:", error);
    toast.error("Failed to update invoice");
    return null;
  }
};

export const markInvoiceAsSent = async (id) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      toast.error("Invalid invoice ID");
      return null;
    }
    
    // Get current invoice to check status
    const currentInvoice = await getInvoiceById(parsedId);
    if (!currentInvoice) {
      toast.error("Invoice not found");
      return null;
    }
    
    if (currentInvoice.status !== "draft") {
      toast.error("Only draft invoices can be marked as sent");
      return null;
    }
    
    const result = await updateInvoice(parsedId, { status: "sent" });
    if (result) {
      toast.success("Invoice marked as sent successfully");
    }
    
    return result;
  } catch (error) {
    console.error("Error marking invoice as sent:", error);
    toast.error("Failed to mark invoice as sent");
    return null;
  }
};

export const markInvoiceAsPaid = async (id, paymentDate) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      toast.error("Invalid invoice ID");
      return null;
    }
    
    // Get current invoice to check status
    const currentInvoice = await getInvoiceById(parsedId);
    if (!currentInvoice) {
      toast.error("Invoice not found");
      return null;
    }
    
    if (currentInvoice.status === "paid") {
      toast.error("Invoice is already marked as paid");
      return null;
    }
    
    if (!paymentDate) {
      toast.error("Payment date is required");
      return null;
    }
    
    const result = await updateInvoice(parsedId, { 
      status: "paid",
      paymentDate: new Date(paymentDate).toISOString()
    });
    
    if (result) {
      toast.success("Invoice marked as paid successfully");
    }
    
    return result;
  } catch (error) {
    console.error("Error marking invoice as paid:", error);
    toast.error("Failed to mark invoice as paid");
    return null;
  }
};

export const deleteInvoice = async (id) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      toast.error("Invalid invoice ID");
      return false;
    }
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [parsedId]
    };
    
    const response = await apperClient.deleteRecord('invoice', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }
    
    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success("Invoice deleted successfully");
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    toast.error("Failed to delete invoice");
    return false;
  }
};