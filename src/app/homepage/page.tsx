"use client";

import React, { useEffect, useState } from "react";
import supabase from "../supabase";

const fetchStudentData = async (authUserId: string) => {
  try {
    const { data: parent, error: parentError } = await supabase
      .from("parents")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (parentError || !parent) throw new Error("Parent not found");

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("parent_id", parent.id)
      .single();

    if (studentError || !student) throw new Error("Student not found");

    const { data: attendance, error: attendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", student.id);

    if (attendanceError) throw new Error("Error fetching attendance records");

    return { student, attendance };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export default function Homepage() {
  const [studentData, setStudentData] = useState<{
    student: any;
    attendance: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUserId = "6655352e-f357-476e-9fad-f307ae6a9d35"; // Replace with logic to get authenticated user ID
        const data = await fetchStudentData(authUserId);
        setStudentData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No student data available.</div>
      </div>
    );
  }

  const { student, attendance } = studentData;

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-lg rounded-lg mt-5">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Student Attendance
      </h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">{student.name}</h2>
        <p className="text-gray-600">Email: {student.email}</p>
        <p className="text-gray-600">QR Code: {student.qr_code}</p>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Attendance Records
      </h3>
      <ul className="space-y-2">
        {attendance.map((record) => (
          <li
            key={record.id}
            className="p-4 bg-gray-50 border border-gray-200 rounded-md"
          >
            <p className="text-gray-700">
              {record.type === "time_in" ? "Time In" : "Time Out"}:{" "}
              <span className="font-medium">
                {new Date(record.time).toLocaleString()}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
