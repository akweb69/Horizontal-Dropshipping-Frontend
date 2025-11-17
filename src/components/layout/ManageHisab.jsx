import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Loader2,
  Calendar,
  DollarSign,
  Package,
  User,
  Camera,
  Search,
  Filter,
  X,
  ChevronDown,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { useDebounce } from 'use-debounce';
import Loader11 from './Loader11';
import Swal from 'sweetalert2';

const ManageHisab = () => {
  const base_url = import.meta.env.VITE_BASE_URL;
  const imgbb_api_key = import.meta.env.VITE_IMGBB_API_KEY;

  const { user, loading: authLoading } = useAuth();
  const [hisab, setHisab] = useState([]);
  const [loading1, setLoading1] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Debounce search
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  // Form State
  const [formData, setFormData] = useState({
    productname: '',
    price: '',
    units: '',
    totalprice: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    productImg: '',
  });

  // Fetch Hisab
  const fetchHisab = async () => {
    setLoading1(true);
    try {
      const res = await axios.get(`${base_url}/admin_hisab`);
      setHisab(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading1(false);
    }
  };

  useEffect(() => {
    if (user) fetchHisab();
  }, [user]);

  // Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataImg = new FormData();
    formDataImg.append('image', file);

    try {
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${imgbb_api_key}`,
        formDataImg
      );
      setFormData((prev) => ({ ...prev, productImg: res.data.data.url }));
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Auto calculate total
  useEffect(() => {
    if (formData.price && formData.units) {
      const total = parseFloat(formData.price) * parseFloat(formData.units);
      setFormData((prev) => ({ ...prev, totalprice: total.toFixed(2) }));
    }
  }, [formData.price, formData.units]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productImg) return alert('Please upload an image');

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        units: parseFloat(formData.units),
        totalprice: parseFloat(formData.totalprice),
        adminName: user?.name || user?.email,
        adminEmail: user?.email,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      await axios.post(`${base_url}/admin_hisab`, payload);
      fetchHisab();
      setFormOpen(false);
      resetForm();
    } catch (err) {
      alert('Failed to add hisab');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productname: '',
      price: '',
      units: '',
      totalprice: '',
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      productImg: '',
    });
  };

  // Update Status
  const updateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await axios.patch(`${base_url}/admin_hisab/${id}`, { status: newStatus });
      fetchHisab();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Clear Filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriceMin('');
    setPriceMax('');
    setDateFrom('');
    setDateTo('');
  };

  // Filtered Data
  const filteredHisab = useMemo(() => {
    return hisab.filter((item) => {
      // Search
      const matchesSearch =
        debouncedSearch === '' ||
        item.productname.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.supplier.toLowerCase().includes(debouncedSearch.toLowerCase());

      // Status
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      // Price Range
      const itemPrice = item.totalprice;
      const minPrice = priceMin === '' ? -Infinity : parseFloat(priceMin);
      const maxPrice = priceMax === '' ? Infinity : parseFloat(priceMax);
      const matchesPrice = itemPrice >= minPrice && itemPrice <= maxPrice;

      // Date Range
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const itemDate = parseISO(item.date);
        const from = dateFrom ? parseISO(dateFrom) : new Date('1970-01-01');
        const to = dateTo ? parseISO(dateTo) : new Date();

        matchesDate = isWithinInterval(itemDate, { start: from, end: to });
      }

      return matchesSearch && matchesStatus && matchesPrice && matchesDate;
    });
  }, [hisab, debouncedSearch, statusFilter, priceMin, priceMax, dateFrom, dateTo]);

  // delete-->
  const handleDelete = (id) => {
    console.log(id)

    Swal.fire({
      title: "ডিলিট করতে চান?",
      text: "একবার ডিলিট করলে আপনি এটি পুনরুদ্ধার করতে পারবেন না!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "হ্যাঁ, ডিলিট করুন",
      cancelButtonText: "না, বাতিল করুন"
    }).then((result) => {
      if (result.isConfirmed) {
        // delete
        axios.delete(`${base_url}/admin_hisab/${id}`)
          .then(res => {

            Swal.fire({
              title: "ডিলিট হয়েছে!",
              text: "ডাটা ডিলিট হয়েছে.",
              icon: "success"
            });
            fetchHisab();
          })

      }
    });
  }

  if (authLoading || loading1) {
    return (
      <Loader11></Loader11>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Hisab</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-orange-600 transition"
        >
          <Plus className="w-5 h-5" />
          Add Hisab
        </motion.button>
      </div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-xl shadow-md mb-6 space-y-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search product or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Price Range */}
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min Price"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-gray-500">—</span>
            <input
              type="number"
              placeholder="Max Price"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Date Range */}
          {/* <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div> */}

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>

        {/* Active Filters Count */}
        {(debouncedSearch || statusFilter !== 'all' || priceMin || priceMax || dateFrom || dateTo) && (
          <div className="text-sm text-orange-600">
            {filteredHisab.length} of {hisab.length} entries shown
          </div>
        )}
      </motion.div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-orange-600">Add New Hisab</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.productname}
                      onChange={(e) =>
                        setFormData({ ...formData, productname: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.supplier}
                      onChange={(e) =>
                        setFormData({ ...formData, supplier: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Unit
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.units}
                      onChange={(e) =>
                        setFormData({ ...formData, units: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Price
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.totalprice}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-orange-50 text-orange-600 px-4 py-2 rounded-lg border-2 border-dashed border-orange-300 hover:bg-orange-100">
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                      <span>{uploading ? 'Uploading...' : 'Choose Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {formData.productImg && (
                      <img
                        src={formData.productImg}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      resetForm();
                    }}
                    className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading || !formData.productImg}
                    className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                    {submitting ? 'Saving...' : 'Save Hisab'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50 border-b border-orange-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredHisab.map((item, idx) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`hover:bg-orange-50 transition ${item.status === 'inactive' ? 'opacity-60' : ''
                      }`}
                  >
                    <td className="px-6 py-4">
                      <img
                        src={item.productImg}
                        alt={item.productname}
                        className="w-12 h-12 object-cover rounded-lg border"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.productname}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ৳{item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.units}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                      ৳{item.totalprice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(item.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${item.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {item.status === 'active' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => updateStatus(item._id, item.status)}
                        disabled={item.status === 'inactive'}
                        className={`p-2 rounded-lg transition ${item.status === 'active'
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        title={
                          item.status === 'inactive'
                            ? 'Cannot edit inactive hisab'
                            : 'Toggle status'
                        }
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {/* delete */}
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="ml-2 p-2 rounded-lg transition bg-red-100 text-red-600 hover:bg-red-200">
                        <Trash2></Trash2>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredHisab.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {hisab.length === 0
                ? 'No hisab entries found. Click "Add Hisab" to get started.'
                : 'No entries match your filters.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageHisab;