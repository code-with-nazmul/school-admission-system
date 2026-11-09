using System.Text.RegularExpressions;
using SchoolAdmission.Api.Exceptions;

namespace SchoolAdmission.Api.Validators;

public static partial class StudentIdValidator
{
    private static readonly Regex Numeric17Regex = new(@"^[0-9]{17}$", RegexOptions.Compiled);

    public static string Validate(string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            throw new ValidationException("X-Student-Id header is required.");
        }

        var trimmed = studentId.Trim();

        if (!Numeric17Regex.IsMatch(trimmed))
        {
            throw new ValidationException("Student ID must be a 17-digit numerical value.");
        }

        return trimmed;
    }
}

