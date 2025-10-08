import { useState } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SearchAndFilter = ({ onFilter, onClearFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [category, setCategory] = useState('all');

  const priceRanges = {
    'all': [0, 1000000],
    'under-1000': [0, 1000],
    '1000-5000': [1000, 5000],
    '5000-10000': [5000, 10000],
    'over-10000': [10000, 1000000]
  };

  const handleApplyFilters = () => {
    onFilter(searchTerm, priceRanges[priceRange], category);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriceRange('all');
    setCategory('all');
    onClearFilters();
  };

  // Check if any filters are applied
  const hasActiveFilters = searchTerm !== '' || priceRange !== 'all' || category !== 'all';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <Input
          type="search"
          placeholder="Search jewelry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-[40%]"
        />
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="under-1000">Under $1,000</SelectItem>
            <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
            <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
            <SelectItem value="over-10000">Over $10,000</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jewelry</SelectItem>
            <SelectItem value="rings">Rings</SelectItem>
            <SelectItem value="necklaces">Necklaces</SelectItem>
            <SelectItem value="pendants">Pendants</SelectItem>
            <SelectItem value="earrings">Earrings</SelectItem>
            <SelectItem value="bracelets">Bracelets</SelectItem>
            <SelectItem value="anklets">Anklets</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button onClick={handleApplyFilters}>
            Search
          </Button>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="whitespace-nowrap"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
// This is client/src/components/shopping-view/SearchAndFilter.jsx