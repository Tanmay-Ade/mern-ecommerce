import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { selectAddress } from "../../store/shop/address-slice";

const AddressCard = ({ addressInfo, handleDeleteAddress, handleEditAddress }) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const selectedAddress = useSelector((state) => state.shopAddress.selectedAddress);

  const handleEdit = async () => {
    setIsLoading(true);
    await handleEditAddress(addressInfo);
    setIsLoading(false);
  };

  const handleAddressSelect = () => {
    dispatch(selectAddress(addressInfo));
    console.log('Selected address:', addressInfo);
  };

  const isSelected = selectedAddress?._id === addressInfo._id;

  return (
    <Card className={`${isSelected ? 'border-primary border-2' : ''}`}>
      <CardContent className='grid gap-4 p-4'>
        <Label>Address: {addressInfo?.address}</Label>
        <Label>City: {addressInfo?.city}</Label>
        <Label>Pincode: {addressInfo?.pincode}</Label>
        <Label>Phone: {addressInfo?.phone}</Label>
        <Label>Notes: {addressInfo?.notes}</Label>
      </CardContent>
      <CardFooter className='flex justify-between p-3'>
        <Button 
          onClick={handleAddressSelect}
          variant={isSelected ? "secondary" : "outline"}
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
        <Button 
          onClick={handleEdit}
          disabled={isLoading}
        >
          {isLoading ? 'Editing...' : 'Edit'}
        </Button>
        <Button 
          onClick={() => handleDeleteAddress(addressInfo)}
          disabled={isLoading}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddressCard;
// This is client/src/components/shopping-view/AddressCard.jsx