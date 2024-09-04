import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  // Mock user data
  const mockUser: User = { id: 1, email: 'test@example.com', username: 'testuser', password: 'password123' } as User;

  // Mock repository
  const mockUserRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  // Mock JwtService
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ username: createUserDto.username });
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining(createUserDto));
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user already exists', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);

      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ username: createUserDto.username });
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);

      const result = await service.login('testuser', 'password123');

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ username: 'testuser' });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.login('unknownuser', 'password123')).rejects.toThrow(BadRequestException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ username: 'unknownuser' });
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);

      await expect(service.login('testuser', 'wrongpassword')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(2)).rejects.toThrow(BadRequestException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        username: 'updateduser',
        password: 'newpassword123',
      };

      jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await service.update(1, updateUserDto);

      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ ...updateUserDto, id: 1 }));
      expect(result).toEqual({ ...mockUser, ...updateUserDto });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(userRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.remove(2)).rejects.toThrow(BadRequestException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { UserService } from './user.service';
// import { User } from './entities/user.entity';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { JwtService } from '@nestjs/jwt';
// import { BadRequestException } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// describe('UserService', () => {
//   let service: UserService;
//   let userRepository: Repository<User>;
//   let jwtService: JwtService;

//   const mockUser: User = { id: 1, email: 'test@example.com', username: 'testuser', password: 'password123' } as User;

//   const mockUserRepository = {
//     findOneBy: jest.fn(),
//     save: jest.fn(),
//     find: jest.fn(),
//     delete: jest.fn(),
//   };

//   const mockJwtService = {
//     sign: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UserService,
//         {
//           provide: getRepositoryToken(User),
//           useValue: mockUserRepository,
//         },
//         {
//           provide: JwtService,
//           useValue: mockJwtService,
//         },
//       ],
//     }).compile();

//     service = module.get<UserService>(UserService);
//     userRepository = module.get<Repository<User>>(getRepositoryToken(User));
//     jwtService = module.get<JwtService>(JwtService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   // Example test case to ensure at least one test runs successfully.
//   describe('create', () => {
//     it('should create a new user', async () => {
//       const createUserDto: CreateUserDto = {
//         email: 'test@example.com',
//         username: 'testuser',
//         password: 'password123',
//       };

//       jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
//       jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

//       const result = await service.create(createUserDto);

//       expect(userRepository.findOneBy).toHaveBeenCalledWith({ username: createUserDto.username });
//       expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining(createUserDto));
//       expect(result).toEqual(mockUser);
//     });
//   });
// });
