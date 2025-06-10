# Problem 1 from Project Euler


# prompt used for Cline: Please develop a script that 
# 1. find all the natural numbers bellow 1000 that are multiples of 3 or 5
# 2. sum of these multiples



#!/usr/bin/env python3
"""
Script to find all natural numbers below 1000 that are multiples of 3 or 5,
and calculate their sum.
"""

def find_multiples_and_sum(limit):
    """
    Find all natural numbers below the given limit that are multiples of 3 or 5,
    and calculate their sum.
    
    Args:
        limit (int): The upper limit (exclusive) for finding multiples
        
    Returns:
        tuple: A tuple containing (list of multiples, sum of multiples)
    """
    multiples = []
    
    for num in range(1, limit):
        if num % 3 == 0 or num % 5 == 0:
            multiples.append(num)
    
    return multiples, sum(multiples)

if __name__ == "__main__":
    limit = 1000
    multiples, total_sum = find_multiples_and_sum(limit)
    
    print(f"Natural numbers below {limit} that are multiples of 3 or 5:")
    # Only print the first few multiples to avoid cluttering the output
    if len(multiples) > 10:
        print(f"First 10 multiples: {multiples[:10]}...")
        print(f"Total number of multiples found: {len(multiples)}")
    else:
        print(f"Multiples: {multiples}")
    print(f"Sum of these multiples: {total_sum}")

########
# output:
# Natural numbers below 1000 that are multiples of 3 or 5:
# First 10 multiples: [3, 5, 6, 9, 10, 12, 15, 18, 20, 21]...
# Total number of multiples found: 466
# Sum of these multiples: 233168
