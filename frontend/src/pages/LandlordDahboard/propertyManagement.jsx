import React, { useState } from 'react';
import { 
  useGetPropertiesQuery, 
  useCreatePropertyMutation, 
  useDeletePropertyMutation 
} from '../store/api/propertiesApi'; // Adjust path based on your folder structure
import { Plus, Trash2, Home, MapPin, DollarSign, Loader2, X } from 'lucide-react';

const PropertyManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // RTK Query hooks
  const { data, isLoading, isError } = useGetPropertiesQuery();
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
  const [deleteProperty] = useDeletePropertyMutation();

  const properties = data?.properties || [];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await deleteProperty(id);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
            <p className="text-gray-600">Manage your real estate portfolio</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} /> Add Property
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : isError ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">Error loading properties.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
                    <button 
                      onClick={() => handleDelete(property.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center text-gray-500 text-sm">
                    <MapPin size={14} className="mr-1" />
                    {property.city}, {property.state}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-blue-600 font-bold text-xl">
                      {property.currency || '$'}{property.price?.toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      property.status === 'vacant' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {property.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between text-sm text-gray-600">
                  <span>{property.bedrooms} Beds</span>
                  <span>{property.bathrooms} Baths</span>
                  <span>{property.size} sqft</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Property Modal */}
        {isModalOpen && (
          <AddPropertyModal 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={createProperty} 
            isLoading={isCreating}
          />
        )}
      </div>
    </div>
  );
};

// Form Component
const AddPropertyModal = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    price: '',
    currency: 'USD',
    deposit: '',
    availableFrom: '',
    propertyType: 'Apartment',
    bedrooms: '',
    bathrooms: '',
    size: '',
    amenities: '',
    status: 'vacant',
    landlordId: 'landlord-uuid-here' // In a real app, get this from your Auth Context/State
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Logic to auto-generate slug if empty
      const finalData = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      };
      
      await onSubmit(finalData).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to save property:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Add New Property</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Property Title</label>
            <input required name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="Luxury Modern Apartment" />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg" rows="3" />
          </div>

          {/* Pricing & Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Price (Monthly)</label>
            <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Security Deposit</label>
            <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address Line</label>
            <input name="addressLine" value={formData.addressLine} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">City</label>
              <input name="city" value={formData.city} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">State</label>
              <input name="state" value={formData.state} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Beds</label>
              <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Baths</label>
              <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Size (sqft)</label>
              <input type="number" name="size" value={formData.size} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Available From</label>
            <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Amenities (comma separated)</label>
            <input 
              name="amenities" 
              value={formData.amenities} 
              onChange={handleChange} 
              className="w-full p-2 border rounded-lg" 
              placeholder="Gym, Pool, Parking, WiFi" 
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Save Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyManagement;