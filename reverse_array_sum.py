# Problem: Add Two Numbers


def reverse_array_to_number(arr):
    """
    Convert an array of digits in reverse order to a number.
    Example: [1, 2, 3] -> 321
    """
    result = 0
    for i, digit in enumerate(arr):
        result += digit * (10 ** i)
    return result

def number_to_reverse_array(num):
    """
    Convert a number to an array of digits in reverse order.
    Example: 321 -> [1, 2, 3]
    """
    if num == 0:
        return [0]
    
    result = []
    while num > 0:
        result.append(num % 10)
        num //= 10
    return result

def sum_reverse_arrays(arr1, arr2):
    """
    Sum two numbers represented as reverse arrays and return the result as a reverse array.
    
    Args:
        arr1: First array of digits in reverse order
        arr2: Second array of digits in reverse order
        
    Returns:
        Array representing the sum, with digits in reverse order
    """
    # Convert arrays to numbers
    num1 = reverse_array_to_number(arr1)
    num2 = reverse_array_to_number(arr2)
    
    # Calculate sum
    total = num1 + num2
    
    # Convert sum back to reverse array
    return number_to_reverse_array(total)

# Example usage
if __name__ == "__main__":
    # Example 1
    arr1 = [1, 2, 3]  # Represents 321
    arr2 = [4, 5, 6]  # Represents 654
    result = sum_reverse_arrays(arr1, arr2)
    print(f"Example 1:")
    print(f"Array 1: {arr1} (represents {reverse_array_to_number(arr1)})")
    print(f"Array 2: {arr2} (represents {reverse_array_to_number(arr2)})")
    print(f"Sum: {reverse_array_to_number(arr1) + reverse_array_to_number(arr2)}")
    print(f"Result array: {result}")
    
    # Example 2
    arr1 = [9, 9]  # Represents 99
    arr2 = [1]     # Represents 1
    result = sum_reverse_arrays(arr1, arr2)
    print(f"\nExample 2:")
    print(f"Array 1: {arr1} (represents {reverse_array_to_number(arr1)})")
    print(f"Array 2: {arr2} (represents {reverse_array_to_number(arr2)})")
    print(f"Sum: {reverse_array_to_number(arr1) + reverse_array_to_number(arr2)}")
    print(f"Result array: {result}")



#########
# output:
#Example 1:
#Array 1: [1, 2, 3] (represents 321)
#Array 2: [4, 5, 6] (represents 654)
#Sum: 975
#Result array: [5, 7, 9]

#Example 2:
#Array 1: [9, 9] (represents 99)
#Array 2: [1] (represents 1)
#Sum: 100
#Result array: [0, 0, 1]